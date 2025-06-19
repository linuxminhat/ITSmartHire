import { Module } from '@nestjs/common';
import { ParsingResumesService } from './parsing-resumes.service';
import { HttpModule } from '@nestjs/axios';
import { ParsingResumesController } from './parsing-resumes.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedCVList, SavedCVListSchema } from './schemas/saved-cv-list.schema';
import { Application, ApplicationSchema } from 'src/applications/schemas/application.schema';

@Module({
  imports: [
    HttpModule.register({ timeout: 120000 }),

    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
      }
    }),
    MongooseModule.forFeature([
      { name: SavedCVList.name, schema: SavedCVListSchema },
      { name: Application.name, schema: ApplicationSchema }
    ]),
  ],
  controllers: [ParsingResumesController],
  providers: [ParsingResumesService],
  exports: [ParsingResumesService],
})
export class ParsingResumesModule { }
