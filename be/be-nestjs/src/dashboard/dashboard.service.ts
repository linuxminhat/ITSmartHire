import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Job } from '../jobs/schemas/job.schema';
import { DashboardStats, TopSkill, TopCompany, TopCategory, UserGrowth } from './interfaces/dashboard.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Job.name) private jobModel: Model<Job>,
  ) { }

  async getStats(): Promise<DashboardStats> {
    const [totalUsers, totalRecruiters, totalJobs, activeJobs] = await Promise.all([
      this.userModel.countDocuments({ 'role.name': 'USER' }),
      this.userModel.countDocuments({ 'role.name': 'HR' }),
      this.jobModel.countDocuments(),
      this.jobModel.countDocuments({ isActive: true }),
    ]);

    return {
      totalUsers,
      totalRecruiters,
      totalJobs,
      activeJobs,
    };
  }

  async getTopSkills(): Promise<TopSkill[]> {
    return this.jobModel.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skillInfo'
        }
      },
      { $unwind: '$skillInfo' },
      {
        $project: {
          _id: '$_id',
          name: '$skillInfo.name',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
  }

  async getTopCompanies(): Promise<TopCompany[]> {
    return this.jobModel.aggregate([
      {
        $group: {
          _id: '$company._id',
          name: { $first: '$company.name' },
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);
  }

  async getTopCategories(): Promise<TopCategory[]> {
    return this.jobModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: '$_id',
          name: '$categoryInfo.name',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
  }

  async getUserGrowth(): Promise<UserGrowth[]> {
    return this.userModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' }
            ]
          },
          count: 1
        }
      },
      { $sort: { month: 1 } },
      { $limit: 12 }
    ]);
  }
}