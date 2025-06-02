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
  private CONCURRENT_LIMIT = 2; // Gemini Pro: nên để 2-3 để an toàn

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

  async extractAndCleanText(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    return Promise.all(
      files.map(async file => {
        const ext = file.originalname.split('.').pop().toLowerCase();
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

  // async callLLMParser(texts: string[]): Promise<any[]> {
  //   this.writeLog('SENDING TO LLM SERVER (GEMINI)', {
  //     totalTexts: texts.length,
  //     textLengths: texts.map(t => t.length)
  //   });

  //   const results: any[] = [];
  //   const MIN_GAP_MS = 200;
  //   let lastCallTime = 0;

  //   for (let i = 0; i < texts.length; i++) {
  //     const text = texts[i];
  //     let done = false;
  //     let attempt = 0;

  //     while (!done) {

  //       const now = Date.now();
  //       if (lastCallTime > 0) {
  //         const elapsedSinceLast = now - lastCallTime;
  //         const extraWait = MIN_GAP_MS - elapsedSinceLast;
  //         if (extraWait > 0) {
  //           console.log(`Chờ thêm ${extraWait} ms để đảm bảo không vượt giới hạn.`);
  //           await new Promise(r => setTimeout(r, extraWait));
  //         }
  //       }

  //       console.log(`Processing CV #${i + 1}/${texts.length}, attempt #${attempt + 1}...`);
  //       const startTime = Date.now();

  //       try {
  //         const response = await axios.post(
  //           'http://127.0.0.1:6969/resume_parsing',
  //           { cv: text },
  //           { timeout: 120000, headers: { 'Content-Type': 'application/json' } }
  //         );
  //         const latencySec = (Date.now() - startTime) / 1000;
  //         console.log(`API latency cho CV #${i + 1}: ${latencySec.toFixed(2)} s`);

  //         this.writeLog(`LLM SERVER RESPONSE - CV #${i + 1}`, {
  //           success: response.data.success,
  //           method: response.data.method,
  //           dataFields: Object.keys(response.data.data || {}),
  //           skillsCount: response.data.data?.skills?.length || 0,
  //           workExpCount: response.data.data?.workExperiences?.length || 0
  //         });

  //         results.push(response.data.data);
  //         lastCallTime = Date.now();
  //         done = true;
  //       } catch (error: any) {
  //         const status = error.response?.status;
  //         const retryInfo = error.response?.data?.retry_delay;
  //         attempt++;


  //         if (status === 429 && retryInfo?.seconds) {
  //           const waitMs = retryInfo.seconds * 1000;
  //           console.warn(`CV #${i + 1} bị 429, chờ ${waitMs} ms rồi retry...`);
  //           await new Promise(r => setTimeout(r, waitMs));

  //         }

  //         else if (error.code === 'ECONNABORTED' || !error.response) {
  //           if (attempt < 2) {
  //             console.warn(`CV #${i + 1} gặp lỗi network/timeout, retry lần ${attempt + 1}...`);
  //             // Có thể chờ thêm 1s trước khi retry tiếp
  //             await new Promise(r => setTimeout(r, 1000));
  //           } else {
  //             console.error(`CV #${i + 1} lỗi network sau ${attempt} lần thử, trả về empty.`);
  //             results.push(this.createEmptyResult());
  //             lastCallTime = Date.now();
  //             done = true;
  //           }
  //         }
  //         // Các lỗi khác (JSON decode, unexpected), bỏ luôn
  //         else {
  //           console.error(`CV #${i + 1} gặp lỗi không xác định:`, error.message);
  //           results.push(this.createEmptyResult());
  //           lastCallTime = Date.now();
  //           done = true;
  //         }
  //       }
  //     }
  //   }

  //   console.log(
  //     `Completed processing ${texts.length} CVs. Successful: ${results.filter(r => r.name || r.email).length}`
  //   );
  //   return results;
  // }


  // private createEmptyResult() {
  //   return {
  //     name: '',
  //     email: '',
  //     phone: '',
  //     github: '',
  //     location: '',
  //     university: '',
  //     degree: '',
  //     gpa: '',
  //     graduationYear: '',
  //     workExperiences: [],
  //     projects: [],
  //     skills: [],
  //     certifications: []
  //   };
  // }

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
          .filter((skill, index, arr) => arr.indexOf(skill) === index); // Remove duplicates
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

  // Update main method to use LLM
  async mapTokensToFields_OLD_METHOD(lists: { token: string; tag: string; position: number }[][]) {
    // Keep this for reference, but won't be used with LLM approach
    // ... existing token processing code ...
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

      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!dto.name || !dto.format || !Array.isArray(dto.cvs)) {
        throw new Error('Invalid save data: missing name, format, or cvs array');
      }

      // Create document data
      const docData = {
        name: dto.name,
        format: dto.format,
        cvs: dto.cvs,
        hrId: userId,
      };

      console.log('Creating savedList document with data:', {
        ...docData,
        cvs: `[${docData.cvs.length} items]` // Don't log full CVs, just count
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

      // Re-throw with more context
      throw new Error(`Failed to save CV list: ${error.message}`);
    }
  }

  // Lấy danh sách đã lưu của HR
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
}
