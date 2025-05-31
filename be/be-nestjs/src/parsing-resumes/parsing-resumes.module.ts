import { Module } from '@nestjs/common';
import { ParsingResumesService } from './parsing-resumes.service';
import { HttpModule } from '@nestjs/axios';
import { ParsingResumesController } from './parsing-resumes.controller';

@Module({
  imports: [
    // Để dùng HttpService.call() 
    HttpModule.register({ timeout: 30000 }),
  ],
  controllers: [ParsingResumesController],
  providers: [ParsingResumesService],
  exports: [ParsingResumesService],
})
export class ParsingResumesModule { }
