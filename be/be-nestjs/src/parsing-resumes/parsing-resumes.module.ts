import { Module } from '@nestjs/common';
import { ParsingResumesService } from './parsing-resumes.service';
import { HttpModule } from '@nestjs/axios';
import { ParsingResumesController } from './parsing-resumes.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { SavedCVList, SavedCVListSchema } from './schemas/saved-cv-list.schema';

@Module({
  imports: [
    HttpModule.register({ timeout: 30000 }),

    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10
      }
    }),
    MongooseModule.forFeature([
      { name: SavedCVList.name, schema: SavedCVListSchema }
    ]),
  ],
  controllers: [ParsingResumesController],
  providers: [ParsingResumesService],
  exports: [ParsingResumesService],
})
export class ParsingResumesModule { }
