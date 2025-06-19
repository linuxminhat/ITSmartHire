import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SavedCVList } from './schemas/saved-cv-list.schema';
import { SaveCVListDto } from './dto/save-cv-list.dto';
import pLimit from 'p-limit';


@Injectable()
export class ParsingResumesService {
  private logDir: string;
  private CONCURRENT_LIMIT = 2;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(SavedCVList.name) private savedCVListModel: Model<SavedCVList>
  ) {
    this.logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
  }

  private writeLog(phase: string, data: any) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFile = path.join(this.logDir, `parsing-${timestamp}.log`);

      const logEntry = `\n=== ${phase} ===\n${JSON.stringify(data, null, 2)}\n`;
      fs.appendFileSync(logFile, logEntry);

      console.log(`${phase} - Logged to: ${logFile}`);
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }

  //extract raw text from file 
  async extractAndCleanText(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    //Parallel processing of multiple files → optimize speed.
    return Promise.all(
      files.map(async file => {
        //file.originalname = "nguyenvana_cv.docx" → ext = "docx".
        const ext = file.originalname.split('.').pop().toLowerCase();
        //Create a variable containing raw text
        let rawText = '';

        if (ext === 'pdf') {
          rawText = (await pdfParse(file.buffer)).text;
        } else if (['doc', 'docx'].includes(ext)) {
          rawText = (await mammoth.extractRawText({ buffer: file.buffer })).value;
        } else {
          throw new Error('Chỉ hỗ trợ PDF và DOCX');
        }

        return rawText
          .replace(/\r?\n/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      })
    );
  }

  async callLLMParser(texts: string[]): Promise<any[]> {
    this.writeLog('SENDING TO LLM SERVER (GEMINI)', {
      totalTexts: texts.length,
      textLengths: texts.map(t => t.length)
    });

    //Initialize parallel processing tasks
    const limit = pLimit(this.CONCURRENT_LIMIT);
    const results: any[] = [];

    const tasks = texts.map((text, idx) => limit(async () => {

      let done = false, attempt = 0, result = this.createEmptyResult();
      while (!done && attempt < 3) {
        const startTime = Date.now();
        try {
          const response = await axios.post(
            'http://127.0.0.1:6969/resume_parsing',
            { cv: text },
            { timeout: 120000, headers: { 'Content-Type': 'application/json' } }
          );
          const latencySec = (Date.now() - startTime) / 1000;
          this.writeLog(`LLM RESPONSE - CV #${idx + 1}`, {
            latencySec, method: response.data.method, fields: Object.keys(response.data.data || {})
          });
          result = response.data.data;
          done = true;
        } catch (error: any) {
          attempt++;
          if (error?.response?.status === 429) {
            const retry = error.response.data?.retry_delay || 5;
            console.warn(`Quota limit, waiting ${retry}s...`);
            await new Promise(res => setTimeout(res, retry * 1000));
          } else if (error.code === 'ECONNABORTED' || !error.response) {
            if (attempt < 3) await new Promise(r => setTimeout(r, 1000));
            else done = true;
          } else {
            done = true;
          }
        }
      }
      return result;
    }));
    return Promise.all(tasks);
  }

  private createEmptyResult() {
    return {
      name: '', email: '', phone: '', github: '', location: '', university: '',
      degree: '', gpa: '', graduationYear: '', workExperiences: [], projects: [],
      skills: [], certifications: []
    };
  }


  async mapTokensToFields(results: any[]): Promise<any[]> {
    this.writeLog('LLM RESULTS - ALREADY STRUCTURED', {
      totalResults: results.length,
      sampleResult: results[0] || null
    });


    return results.map(result => this.cleanupLLMResults(result));
  }

  private cleanupLLMResults(result: any) {
    try {
      // Clean up email
      if (result.email) {
        result.email = result.email
          .replace(/\s+/g, '')
          .toLowerCase()
          .trim();
      }

      // Clean up phone
      if (result.phone) {
        const digits = result.phone.replace(/[^\d]/g, '');
        if (digits.length >= 9 && digits.length <= 11) {
          result.phone = digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
        }
      }

      // Clean up location
      if (result.location) {
        result.location = result.location
          .replace(/\s+/g, ' ')
          .replace(/,\s*,/g, ',')
          .trim();
      }

      // Clean up skills array
      if (result.skills && Array.isArray(result.skills)) {
        result.skills = result.skills
          .filter(skill => skill && skill.trim())
          .map(skill => skill.trim())
          .filter((skill, index, arr) => arr.indexOf(skill) === index);
      }

      // Clean up work experiences
      if (result.workExperiences && Array.isArray(result.workExperiences)) {
        result.workExperiences = result.workExperiences.map(exp => ({
          company: exp.company?.trim() || '',
          position: exp.position?.trim() || '',
          duration: exp.duration?.trim() || '',
          description: Array.isArray(exp.description)
            ? exp.description.filter(desc => desc && desc.trim()).map(desc => desc.trim())
            : []
        }));
      }

      // Clean up projects
      if (result.projects && Array.isArray(result.projects)) {
        result.projects = result.projects.map(proj => ({
          name: proj.name?.trim() || '',
          description: Array.isArray(proj.description)
            ? proj.description.filter(desc => desc && desc.trim()).map(desc => desc.trim())
            : []
        }));
      }

      // Clean up certifications
      if (result.certifications && Array.isArray(result.certifications)) {
        result.certifications = result.certifications
          .filter(cert => cert && cert.trim())
          .map(cert => cert.trim())
          .filter((cert, index, arr) => arr.indexOf(cert) === index); // Remove duplicates
      }

      return result;
    } catch (error) {
      console.error('Error cleaning up LLM results:', error);
      return this.createEmptyResult();
    }
  }

  async mapTokensToFields_OLD_METHOD(lists: { token: string; tag: string; position: number }[][]) {

  }

  // Lưu danh sách CV
  async saveList(dto: SaveCVListDto, userId: string) {
    try {
      console.log('SaveList service called with:', {
        userId,
        dtoName: dto.name,
        dtoFormat: dto.format,
        cvsCount: dto.cvs?.length || 0,
        cvsFirstItem: dto.cvs?.[0] ? Object.keys(dto.cvs[0]) : null
      });

      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!dto.name || !dto.format || !Array.isArray(dto.cvs)) {
        throw new Error('Invalid save data: missing name, format, or cvs array');
      }

      const docData = {
        name: dto.name,
        format: dto.format,
        cvs: dto.cvs,
        hrId: userId,
      };

      console.log('Creating savedList document with data:', {
        ...docData,
        cvs: `[${docData.cvs.length} items]`
      });

      const savedList = new this.savedCVListModel(docData);

      console.log('Document created, attempting to save...');
      const result = await savedList.save();

      console.log('Save successful:', {
        id: result._id,
        name: result.name,
        format: result.format,
        cvsCount: result.cvs?.length || 0
      });

      return result;
    } catch (error) {
      console.error('SaveList service error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        userId,
        dtoProvided: !!dto
      });

      throw new Error(`Failed to save CV list: ${error.message}`);
    }
  }

  async getSavedLists(userId: string) {
    return await this.savedCVListModel
      .find({ hrId: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Xóa danh sách
  async deleteList(id: string, userId: string) {
    return await this.savedCVListModel.findOneAndDelete({
      _id: id,
      hrId: userId
    });
  }

  async scoreResumes(
    fileFromFrontend: Express.Multer.File,
    dataFromController: {
      //job description
      jd: string;
      //score weights
      weights: {
        skills: number;
        experience: number;
        designation: number;
        degree: number;
        gpa: number;
        languages: number;
        awards: number;
        github: number;
        certifications: number;
        projects: number;
      }
    }
  ) {
    try {
      const formData = new FormData();
      const blob = new Blob([fileFromFrontend.buffer], { type: fileFromFrontend.mimetype });
      formData.append('file', blob, fileFromFrontend.originalname);
      formData.append('jd', JSON.stringify({
        position: dataFromController.jd,

      }));
      formData.append('weights', JSON.stringify(dataFromController.weights));

      // Gọi đến AI Server
      const response = await axios.post('http://127.0.0.1:6970/score', formData, {
        headers: {
        },
        responseType: 'arraybuffer'
      });

      // Trả về file Excel đã chấm điểm
      return {
        data: response.data,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="cv_scores_${new Date().toISOString().slice(0, 10)}.xlsx"`
        }
      };
    } catch (error: any) {
      console.error('CV scoring error in service:', error.message);
      if (error.response) {
        console.error('AI Server Response Error Data:', error.response.data ? error.response.data.toString() : 'No data');
        console.error('AI Server Response Error Status:', error.response.status);
      } else if (error.request) {
        console.error('AI Server No Response:', error.request);
      } else {
        console.error('AI Server Request Setup Error:', error.message);
      }
      throw new Error('Failed to score CVs: ' + (error.response?.data?.error || error.message));
    }
  }
}
