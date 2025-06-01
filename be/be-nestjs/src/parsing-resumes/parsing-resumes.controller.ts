import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ParsingResumesService } from './parsing-resumes.service';

@Controller('parsing-resumes')
export class ParsingResumesController {
  constructor(
    private readonly parsingService: ParsingResumesService,
  ) { }

  @Post('upload-and-parse')
  @UseInterceptors(
    FilesInterceptor('cvs', 10, {
      fileFilter: (req, file, callback) => {
        console.log('File filter - Processing file:', {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        });
        
        if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
          console.log('File filter - Rejected file:', file.originalname);
          return callback(new Error('Chỉ cho phép file PDF, DOC, DOCX!'), false);
        }
        
        console.log('File filter - Accepted file:', file.originalname);
        callback(null, true);
      },
      limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 
      },
    }),
  )
  async uploadAndParse(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log('=== UPLOAD AND PARSE REQUEST ===');
      console.log('Raw files parameter:', files);
      console.log('Files length:', files?.length);
      
      if (files) {
        files.forEach((file, index) => {
          console.log(`File ${index}:`, {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            fieldname: file.fieldname
          });
        });
      }

      if (!files || files.length === 0) {
        console.log('ERROR: No files received');
        return {
          success: false,
          message: 'Không có file nào được upload',
          data: [],
        };
      }

      console.log(`Processing ${files.length} file(s)...`);

      // Extract text from files
      const texts = await this.parsingService.extractAndCleanText(files);
      console.log('Extracted texts lengths:', texts.map(t => t.length));
      
      // Call LLM parser instead of BERT
      const llmResults = await this.parsingService.callLLMParser(texts);
      console.log('LLM results count:', llmResults.length);
      
      // Map to final format (cleanup)
      const results = await this.parsingService.mapTokensToFields(llmResults);
      console.log('Final results count:', results.length);

      return {
        success: true,
        data: results,
        message: `Đã xử lý thành công ${files.length} CV(s)`,
      };
    } catch (error) {
      console.error('=== UPLOAD AND PARSE ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      
      return {
        success: false,
        message: error.message || 'Lỗi khi xử lý file',
        data: [],
      };
    }
  }
}
