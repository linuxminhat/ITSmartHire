import { Delete, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';


@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }
  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name, skills, company, salary, quantity,
      level, description, startDate, endDate,
      isActive, location
    } = createJobDto;
    let newJob = this.jobModel.create({
      name, skills, company, salary, quantity,
      level, description, startDate, endDate,
      isActive, location,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    const result = await this.jobModel.find(filter).skip(offset).limit(defaultLimit).sort(sort as any).populate(population).exec();
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result // Return ket qua query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not Found A Job"
    }
    return this.jobModel.findById(id);
  }

  async update(_id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const updated = await this.jobModel.updateOne(
      { _id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return updated;
  }



  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return "Not Found A Job"
    await this.jobModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.jobModel.softDelete({
      _id
    })
  }
  // jobs/jobs.service.ts
  // Sửa lại findByCompany trong jobs.service.ts
  async findByCompany(companyId: string) {
    const jobs = await this.jobModel.find({
      'company._id': new mongoose.Types.ObjectId(companyId),
      isActive: true,
      isDeleted: false
    }).exec();

    return {
      statusCode: 200,
      message: "Successfully fetched jobs by company",
      data: jobs
    };
  }

}
