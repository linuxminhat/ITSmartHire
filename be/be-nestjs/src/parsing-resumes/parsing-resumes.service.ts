import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ParsingResumesService {
  private logDir: string;

  constructor(private readonly httpService: HttpService) {
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

    try {
      const calls = texts.map((text, index) => {
        console.log(`Sending CV #${index + 1} to LLM server...`);
        return axios.post('http://127.0.0.1:6969/resume_parsing', {
          cv: text
        }, {
          timeout: 60000, // 60 seconds timeout
          headers: {
            'Content-Type': 'application/json'
          }
        });
      });

      const responses = await Promise.all(calls);

      responses.forEach((res, index) => {
        this.writeLog(`LLM SERVER RESPONSE - CV #${index + 1}`, {
          success: res.data.success,
          method: res.data.method,
          dataFields: Object.keys(res.data.data || {}),
          skillsCount: res.data.data?.skills?.length || 0,
          workExpCount: res.data.data?.workExperiences?.length || 0
        });
      });

      // LLM trả về structured data rồi, không cần xử lý tokens
      return responses.map(res => res.data.data);

    } catch (error) {
      console.error('Error calling LLM server:', error);
      this.writeLog('LLM SERVER ERROR', {
        error: error.message,
        response: error.response?.data
      });

      // Return empty results for failed requests
      return texts.map(() => this.createEmptyResult());
    }
  }

  private createEmptyResult() {
    return {
      name: '',
      email: '',
      phone: '',
      github: '',
      location: '',
      university: '',
      degree: '',
      gpa: '',
      graduationYear: '',
      workExperiences: [],
      projects: [],
      skills: [],
      certifications: []
    };
  }

  async mapTokensToFields(results: any[]): Promise<any[]> {
    this.writeLog('LLM RESULTS - ALREADY STRUCTURED', {
      totalResults: results.length,
      sampleResult: results[0] || null
    });

    // LLM đã trả về format đúng rồi, chỉ cần clean up
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
}
