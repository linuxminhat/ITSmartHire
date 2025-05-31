import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ParsingResumesService } from './parsing-resumes.service';

@Controller('parsing-resumes')
export class ParsingResumesController {
  constructor(
    private readonly parsingService: ParsingResumesService,
  ) { }

  @Post('upload-and-parse')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'cvs', maxCount: 10 }],
      { storage: multer.memoryStorage() },
    ),
  )
  async uploadAndParse(
    @UploadedFiles() files: { cvs?: Express.Multer.File[] },
  ) {
    const cvs = files.cvs || [];
    if (!cvs.length) {
      throw new BadRequestException('Vui lòng upload ít nhất 1 file CV (max 10)');
    }

    // 1. Extract & clean text
    const texts = await this.parsingService.extractAndCleanText(cvs);

    // 2. Call Flask server để parse
    const tokensList = await this.parsingService.callFlaskParser(texts);

    // 3. Map tokens → structured data
    const structured = this.parsingService.mapTokensToFields(tokensList);

    return structured;
  }
}
