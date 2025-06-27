import { Injectable, Logger } from '@nestjs/common';
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
import { Application, ApplicationDocument } from 'src/applications/schemas/application.schema';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import FormData from 'form-data';

@Injectable()
export class ParsingResumesService {
  private readonly logger = new Logger(ParsingResumesService.name);
  private logDir: string;
  private CONCURRENT_LIMIT = 5;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(SavedCVList.name) private savedCVListModel: Model<SavedCVList>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
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

      this.logger.log(`${phase} - Logged to: ${logFile}`);
    } catch (error) {
      this.logger.error('Error writing log:', error);
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
        try {
          if (ext === 'pdf') {
            rawText = (await pdfParse(file.buffer)).text;
          } else if (['doc', 'docx'].includes(ext)) {
            rawText = (await mammoth.extractRawText({ buffer: file.buffer })).value;
          } else {
            this.logger.warn(`Unsupported file type: ${ext} for file ${file.originalname}`);
            // Return empty string for unsupported files to avoid crashing the whole process
            return '';
          }

          return rawText
            .replace(/\r?\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        } catch (error) {
          this.logger.error(`Failed to extract text from ${file.originalname}`, error);
          return ''; // Return empty string on failure to not break the Promise.all
        }
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
          // Added check for empty text to avoid calling LLM with no content
          if (!text || text.trim().length === 0) {
            this.logger.warn(`CV #${idx + 1} has no content, skipping LLM call.`);
            return this.createEmptyResult();
          }
          const response = await axios.post(
            'http://127.0.0.1:6969/resume_parsing',
            { cv: text },
            {
              timeout: 120000,
              headers: { 'Content-Type': 'application/json' },
              maxBodyLength: Infinity,
              maxContentLength: Infinity,
            }
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
            this.logger.warn(`Quota limit, waiting ${retry}s...`);
            await new Promise(res => setTimeout(res, retry * 1000));
          } else if (error.code === 'ECONNABORTED' || !error.response) {
            this.logger.error(`Timeout or no response for CV #${idx + 1}, attempt ${attempt}`);
            if (attempt < 3) await new Promise(r => setTimeout(r, 1000));
            else done = true;
          } else {
            this.logger.error(`Unhandled error for CV #${idx + 1}, attempt ${attempt}`, error);
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
      skills: [], certifications: [], designations: [], languages: [], awards: []
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
      jd: string;
    }
  ) {
    try {
      const formData = new FormData();
      formData.append('file', fileFromFrontend.buffer, fileFromFrontend.originalname);
      formData.append('jd', dataFromController.jd);

      const response = await axios.post('http://127.0.0.1:6970/score', formData, {
        headers: {
          ...formData.getHeaders(),
        },
        responseType: 'arraybuffer'
      });

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

  private sanitizeString(str: any): string {
    if (str === null || str === undefined) return '';

    const regex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u0084\u0086-\u009F\uFDD0-\uFDEF\uFFFE\uFFFF]/g;
    return String(str).replace(regex, '');
  }

  async analyzeAndExportJobApplications(jobId: string): Promise<Buffer> {
    this.logger.log(`[ANALYSIS START] Job ID: ${jobId}`);

    // 1. Fetch all applications
    const applications = await this.applicationModel.find({ jobId }).exec();
    if (!applications || applications.length === 0) {
      this.logger.warn(`[ANALYSIS] No applications found for jobId: ${jobId}`);
      throw new Error('Không tìm thấy ứng viên nào cho công việc này.');
    }
    this.logger.log(`[ANALYSIS] Found ${applications.length} applications.`);
    this.logger.debug(`[ANALYSIS] Application CV URLs: ${applications.map(a => a.cvUrl).join(', ')}`);


    // 2. Download all CVs concurrently
    const limit = pLimit(5); // Concurrently download 5 files
    const fileDownloadTasks = applications.map(app => limit(async () => {
      try {
        if (!app.cvUrl) {
          this.logger.warn(`[ANALYSIS] Application ${app._id} has no cvUrl.`);
          return null;
        }
        this.logger.log(`[ANALYSIS] Downloading CV from: ${app.cvUrl}`);
        const response = await this.httpService.axiosRef.get(app.cvUrl, {
          responseType: 'arraybuffer',
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        const originalname = path.basename(new URL(app.cvUrl).pathname);
        this.logger.log(`[ANALYSIS] Downloaded ${originalname}, size: ${response.data.length} bytes`);
        return {
          originalname,
          buffer: Buffer.from(response.data),
        } as Express.Multer.File;
      } catch (error) {
        this.logger.error(`[ANALYSIS] Failed to download CV from ${app.cvUrl}`, error.message);
        return null; // Return null for failed downloads
      }
    }));

    const downloadedFiles = (await Promise.all(fileDownloadTasks)).filter(file => file !== null) as Express.Multer.File[];

    if (downloadedFiles.length === 0) {
      this.logger.error('[ANALYSIS] All CV downloads failed.');
      throw new Error('Không thể tải xuống bất kỳ file CV nào.');
    }
    this.logger.log(`[ANALYSIS] Successfully downloaded ${downloadedFiles.length} CVs.`);

    // 3. Parse downloaded CVs
    this.logger.log('[ANALYSIS] Starting text extraction...');
    const texts = await this.extractAndCleanText(downloadedFiles);
    this.logger.log(`[ANALYSIS] Extracted texts lengths: ${texts.map(t => t.length)}`);
    // Check if all texts are empty
    if (texts.every(t => t.length === 0)) {
      this.logger.error('[ANALYSIS] All text extractions resulted in empty content.');
      throw new Error('Không thể trích xuất nội dung từ bất kỳ file CV nào.');
    }


    this.logger.log('[ANALYSIS] Calling LLM parser...');
    const llmResults = await this.callLLMParser(texts.filter(t => t.length > 0)); // Filter out empty texts before sending to LLM
    this.logger.log(`[ANALYSIS] Received ${llmResults.length} results from LLM.`);
    this.logger.debug(`[ANALYSIS] LLM results sample: ${JSON.stringify(llmResults[0]).substring(0, 200)}...`);


    const parsedData = await this.mapTokensToFields(llmResults);
    this.logger.log('parsedData:', JSON.stringify(parsedData, null, 2));

    if (!parsedData || parsedData.length === 0 || parsedData.every(item => !item.name)) {
      this.logger.error('No valid data to export!');
      throw new Error('Không có dữ liệu hợp lệ để xuất Excel!');
    }

    this.logger.log('texts:', texts);
    this.logger.log('llmResults:', llmResults);
    this.logger.log('parsedData:', parsedData);

    // 4. Create Excel file from parsed data
    this.logger.log('[ANALYSIS] Creating Excel buffer...');
    const excelBuffer = await this.createExcelFromDataExcelJS(parsedData);
    this.logger.log(`[ANALYSIS END] Excel buffer created, size: ${excelBuffer.length} bytes.`);

    return excelBuffer;
  }

  private async createExcelFromDataExcelJS(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Parsed CVs');

    // Header
    worksheet.columns = [
      { header: 'Họ và tên', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Điện thoại', key: 'phone', width: 15 },
      { header: 'GitHub', key: 'github', width: 25 },
      { header: 'Địa chỉ', key: 'location', width: 30 },
      { header: 'Trường', key: 'university', width: 30 },
      { header: 'Bằng cấp', key: 'degree', width: 25 },
      { header: 'Điểm GPA', key: 'gpa', width: 10 },
      { header: 'Năm tốt nghiệp', key: 'graduationYear', width: 25 },
      { header: 'Tổng số năm kinh nghiệm', key: 'totalExperienceYears', width: 15 },
      { header: 'Chức danh', key: 'designations', width: 40 },
      { header: 'Kinh nghiệm làm việc', key: 'workExperiences', width: 60 },
      { header: 'Dự án', key: 'projects', width: 60 },
      { header: 'Kỹ năng', key: 'skills', width: 50 },
      { header: 'Ngoại ngữ', key: 'languages', width: 30 },
      { header: 'Giải thưởng', key: 'awards', width: 30 },
      { header: 'Chứng chỉ', key: 'certifications', width: 40 },
    ];

    // Style the header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FF000000' }, size: 12 };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;


    // Data
    data.forEach(item => {
      const row = worksheet.addRow({
        name: item.name,
        email: item.email,
        phone: item.phone,
        github: item.github,
        location: item.location,
        university: item.university,
        degree: item.degree,
        gpa: item.gpa,
        graduationYear: item.graduationYear,
        totalExperienceYears: item.totalExperienceYears,
        designations: Array.isArray(item.designations) ? item.designations.join(', ') : item.designations,
        workExperiences: Array.isArray(item.workExperiences) && item.workExperiences.length > 0 ?
          item.workExperiences.map(exp =>
            `Công ty: ${exp.company || 'N/A'}\nVị trí: ${exp.position || 'N/A'}\nThời gian: ${exp.duration || 'N/A'}\nMô tả:\n${Array.isArray(exp.description) ? exp.description.map(d => `- ${d}`).join('\n') : ''}`
          ).join('\n\n') : item.workExperiences,
        projects: Array.isArray(item.projects) && item.projects.length > 0 ?
          item.projects.map(proj =>
            `[${proj.name || 'N/A'}]\n${Array.isArray(proj.description) ? proj.description.map(d => `- ${d}`).join('\n') : ''}`
          ).join('\n\n') : item.projects,
        skills: Array.isArray(item.skills) ? item.skills.join(', ') : item.skills,
        languages: Array.isArray(item.languages) ? item.languages.join(', ') : item.languages,
        awards: Array.isArray(item.awards) ? item.awards.join(', ') : item.awards,
        certifications: Array.isArray(item.certifications) ? item.certifications.join(', ') : item.certifications,
      });

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const headerKey = worksheet.getColumn(colNumber).key;
        const value = cell.value;

        // Check for empty/null/undefined or empty array
        const isEmpty = value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          cell.value = "Ứng viên không cung cấp thông tin này";
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE5CC' } // Light Orange
          };
          cell.font = {
            color: { argb: 'FF9C4500' }, // Dark Orange
            italic: true
          };
          cell.alignment = { ...cell.alignment, vertical: 'middle', horizontal: 'center' };
        } else if (headerKey === 'totalExperienceYears' && (value === 0 || value === '0')) {
          cell.alignment = { ...cell.alignment, horizontal: 'right' };
        }
      });
    });

    // Add borders to all cells and set alignment
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        // Set default alignment for all cells
        cell.alignment = {
          wrapText: true,
          vertical: 'top',
          ...cell.alignment // Preserve existing alignment settings
        };
      });
    });

    // Export to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  //...
}
