import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { InterviewEvent, InterviewEventSchema } from '../interview-events/schemas/interview-event.schema';
import { HrDashboardController } from './hr-dashboard.controller';
import { HrDashboardService } from './hr-dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: InterviewEvent.name, schema: InterviewEventSchema },
    ]),
  ],
  controllers: [HrDashboardController],
  providers: [HrDashboardService],
})
export class HrDashboardModule {}
