import { Module } from '@nestjs/common';
import { ParsingResumesService } from './parsing-resumes.service';
import { HttpModule } from '@nestjs/axios';
import { ParsingResumesController } from './parsing-resumes.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    // Để dùng HttpService.call() 
    HttpModule.register({ timeout: 30000 }),
    
    // Multer configuration
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10
      }
    }),
  ],
  controllers: [ParsingResumesController],
  providers: [ParsingResumesService],
  exports: [ParsingResumesService],
})
export class ParsingResumesModule { }
