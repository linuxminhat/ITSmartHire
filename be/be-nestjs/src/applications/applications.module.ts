import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';
import { HRNotificationsModule } from 'src/hr-notifications/hr-notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }, { name: Job.name, schema: JobSchema }]), NotificationsModule, HRNotificationsModule
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService] // Export service if needed by other modules
})
export class ApplicationsModule { } 