import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UploadedFile,
  Res,
  Header,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { FileFieldsInterceptor, FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ParsingResumesService } from './parsing-resumes.service';
import { SaveCVListDto } from './dto/save-cv-list.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('parsing-resumes')
@UseGuards(JwtAuthGuard)
export class ParsingResumesController {
  constructor(
    private readonly parsingService: ParsingResumesService,
  ) { }

  //api upload and parse 
  @Post('upload-and-parse')
  //Configure multiple file uploads in one API
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
  //get CV -> parsing -> call LLM -> return result 
  async uploadAndParse(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      console.log('=== UPLOAD AND PARSE REQUEST ===');
      console.log('Raw files parameter:', files);
      console.log('Files length:', files?.length);

      //for loop every file for checking 
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

      //no file upload
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

      // Call LLM  
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

  @Post('analyze-applications/:jobId')
  async analyzeJobApplications(@Param('jobId') jobId: string, @Res() res: Response) {
    try {
      const excelBuffer = await this.parsingService.analyzeAndExportJobApplications(jobId);

      if (!excelBuffer || excelBuffer.length === 0) {
        throw new HttpException('Không thể tạo file Excel. Có thể do không có hồ sơ ứng viên hoặc không trích xuất được dữ liệu.', HttpStatus.BAD_REQUEST);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="analyzed_cvs_${jobId}.xlsx"`);
      res.send(excelBuffer);

    } catch (error) {
      console.error(`Error analyzing applications for job ${jobId}:`, error);
      // It's better to use HttpException for sending error responses in NestJS
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error.message || 'Lỗi khi phân tích hồ sơ', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //api-save-list
  @Post('save-list')
  async saveList(@Body() dto: SaveCVListDto, @Req() req) {
    try {
      //debug
      console.log('Received save request:', {
        endpoint: '/api/v1/parsing-resumes/save-list',
        body: dto,
        user: req.user,
        bodyKeys: Object.keys(dto || {}),
        cvsLength: dto?.cvs?.length || 0,
        userHasId: !!req.user?.id,
        userHas_Id: !!req.user?._id
      });

      const userId = req.user?.id || req.user?._id;
      if (!req.user || !userId) {
        console.error('User not found in request:', {
          hasUser: !!req.user,
          hasId: !!req.user?.id,
          has_Id: !!req.user?._id
        });
        return {
          success: false,
          message: 'User authentication failed',
          error: 'USER_NOT_FOUND'
        };
      }

      // Validate DTO data
      if (!dto.name || !dto.format || !dto.cvs) {
        console.error('Invalid DTO data:', {
          hasName: !!dto.name,
          hasFormat: !!dto.format,
          hasCvs: !!dto.cvs,
          cvsIsArray: Array.isArray(dto.cvs)
        });
        return {
          success: false,
          message: 'Missing required fields',
          error: 'INVALID_DATA'
        };
      }

      console.log('Calling service saveList with:', {
        userId: userId,
        dtoName: dto.name,
        dtoFormat: dto.format,
        cvsCount: dto.cvs.length
      });

      //call service for saving cv-list
      const result = await this.parsingService.saveList(dto, userId);

      console.log('Save result:', result);
      return {
        success: true,
        data: result,
        message: 'CV list saved successfully'
      };
    } catch (error) {
      console.error('Save error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });


      return {
        success: false,
        message: 'Failed to save CV list',
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      };
    }
  }

  @Get('saved-lists')
  async getSavedLists(@Req() req) {
    const userId = req.user?.id || req.user?._id;
    return await this.parsingService.getSavedLists(userId);
  }

  @Delete('saved-lists/:id')
  async deleteList(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id || req.user?._id;
    return await this.parsingService.deleteList(id, userId);
  }

  //compare cv and jd
  @Post('score')
  @UseInterceptors(FileInterceptor('file'))
  async scoreResumes(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      jd: string;
    },
    @Res() res: Response,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('File is required.');
      }
      if (!body.jd) {
        throw new BadRequestException('JD is required.');
      }

      const result = await this.parsingService.scoreResumes(file, { jd: body.jd });

      //return the result for client
      res.setHeader('Content-Type', result.headers['Content-Type']);
      res.setHeader('Content-Disposition', result.headers['Content-Disposition']);

      res.send(Buffer.from(result.data as ArrayBuffer));

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in scoreResumes controller:', error);
      if (!res.headersSent) {
        res.status(400).json({
          statusCode: 400,
          message: error.message || 'Failed to score CVs due to an internal error.',
          error: "Bad Request"
        });
      } else {

        console.error("Error occurred after headers were sent. Could not send JSON error response.");
      }
    }
  }
}
