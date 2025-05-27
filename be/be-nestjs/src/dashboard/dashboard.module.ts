// dashboard.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DatabasesModule } from 'src/databases/databases.module';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';

@Module({
  imports: [
    DatabasesModule,                             // đã có User & Role
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },    // chỉ register Job thôi
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
