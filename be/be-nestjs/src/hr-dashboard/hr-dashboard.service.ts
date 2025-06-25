import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { Application, ApplicationDocument } from '../applications/schemas/application.schema';
import { InterviewEvent } from '../interview-events/schemas/interview-event.schema';
import { IUser } from '../users/users.interface';
import { HrDashboardStats, TopPosition, ApplicationStatusDistribution, MonthlyGrowth } from './interfaces/hr-dashboard.interface';

@Injectable()
export class HrDashboardService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(InterviewEvent.name) private interviewEventModel: Model<InterviewEvent>,
  ) {}

  async getStats(user: IUser): Promise<HrDashboardStats> {
    const hrId = new Types.ObjectId(user._id);

    const jobs = await this.jobModel.find({ hrId, isDeleted: false }).select('_id isActive').lean();
    const jobIds = jobs.map(j => j._id);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.isActive).length;

    const totalApplications = await this.applicationModel.countDocuments({ jobId: { $in: jobIds } });
    const totalInterviews = await this.interviewEventModel.countDocuments({ hrId: user._id });

    return { totalJobs, activeJobs, totalApplications, totalInterviews };
  }

  async getTopPositions(user: IUser): Promise<TopPosition[]> {
    const hrId = new Types.ObjectId(user._id);
    const jobIds = (await this.jobModel.find({ hrId, isDeleted: false }).select('_id').lean()).map(j => j._id);

    if (jobIds.length === 0) return [];

    return this.applicationModel.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'jobInfo',
        },
      },
      { $unwind: '$jobInfo' },
      {
        $project: {
          _id: '$jobInfo._id',
          name: '$jobInfo.name',
          count: 1,
        },
      },
    ]);
  }

  async getApplicationStatus(user: IUser): Promise<ApplicationStatusDistribution[]> {
    const hrId = new Types.ObjectId(user._id);
    const jobIds = (await this.jobModel.find({ hrId, isDeleted: false }).select('_id').lean()).map(j => j._id);

    if (jobIds.length === 0) return [];

    return this.applicationModel.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
    ]);
  }

  async getJobGrowth(user: IUser): Promise<MonthlyGrowth[]> {
    const hrId = new Types.ObjectId(user._id);

    const jobData = await this.jobModel.aggregate([
      { $match: { hrId, isDeleted: false } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
          count: 1,
        },
      },
    ]);

    const jobMap = new Map<string, number>();
    jobData.forEach(item => {
      jobMap.set(item.month, item.count);
    });

    const last12Months: MonthlyGrowth[] = [];
    const today = new Date();
    today.setDate(1);

    for (let i = 0; i < 12; i++) {
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const monthKey = `${year}-${month}`;

      last12Months.push({
        month: monthKey,
        count: jobMap.get(monthKey) || 0,
      });

      today.setMonth(today.getMonth() - 1);
    }

    return last12Months.reverse();
  }

  async getInterviewGrowth(user: IUser): Promise<MonthlyGrowth[]> {
    const interviewData = await this.interviewEventModel.aggregate([
      { $match: { hrId: user._id } },
      {
        $group: {
          _id: { year: { $year: '$start' }, month: { $month: '$start' } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: { $concat: [{ $toString: '$_id.year' }, '-', { $toString: '$_id.month' }] },
          count: 1,
        },
      },
    ]);
    
    const interviewMap = new Map<string, number>();
    interviewData.forEach(item => {
      interviewMap.set(item.month, item.count);
    });

    const last12Months: MonthlyGrowth[] = [];
    const today = new Date();
    today.setDate(1);

    for (let i = 0; i < 12; i++) {
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const monthKey = `${year}-${month}`;

      last12Months.push({
        month: monthKey,
        count: interviewMap.get(monthKey) || 0,
      });

      today.setMonth(today.getMonth() - 1);
    }

    return last12Months.reverse();
  }
}
