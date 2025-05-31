import { Injectable } from '@nestjs/common';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ParsingResumesService {
  constructor(private readonly httpService: HttpService) { }

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

  async callFlaskParser(
    texts: string[],
  ): Promise<{ token: string; tag: string; position: number }[][]> {
    const calls = texts.map(text =>
      axios.post('http://localhost:6969/resume_parsing', { cv: text }),
    );
    const responses = await Promise.all(calls);
    return responses.map(res => res.data.tokens);
  }

  mapTokensToFields(
    lists: { token: string; tag: string; position: number }[][],
  ) {
    return lists.map(pairs => {
      const out: any = {
        name: '',
        university: '',
        github: '',
        skills: [] as string[],
        // thêm field khác nếu cần
      };

      let current = null;
      for (const { token, tag } of pairs) {
        const clean = token.replace('##', '');
        if (/^(B|U)-/.test(tag)) {
          current = tag.split('-')[1].toLowerCase();
          if (current.includes('skills')) {
            out.skills.push(clean);
          } else {
            out[current] = (out[current] || '') + clean + ' ';
          }
        } else if (/^(I|L)-/.test(tag) && current) {
          if (current.includes('skills')) {
            out.skills.push(clean);
          } else {
            out[current] += clean + ' ';
          }
        } else {
          current = null;
        }
      }

      // trim mọi string
      Object.keys(out).forEach(k => {
        if (typeof out[k] === 'string') out[k] = out[k].trim();
      });

      return out;
    });
  }
}
