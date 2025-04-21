import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application, ApplicationSchema } from './schemas/application.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService] // Export service if needed by other modules
})
export class ApplicationsModule {} 