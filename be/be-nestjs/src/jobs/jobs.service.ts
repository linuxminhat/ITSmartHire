import { Delete, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { FindJobsBySkillsDto } from './dto/find-jobs-by-skills.dto';


@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>) { }
  async create(createJobDto: CreateJobDto, user: IUser) {
    const {
      name, skills, company, salary, quantity,
      level, description, startDate, endDate,
      isActive, location,
      category
    } = createJobDto;
    
    await this.jobModel.create({
      name, skills, company, salary, quantity,
      level, description, startDate, endDate,
      isActive, location,
      category,
      hrId: user._id,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    
    return {
        statusCode: 201,
        message: "Tạo việc làm thành công"
    }
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;
    
    let finalFilter = { ...filter };
    if (user?.role?.name === 'HR') {
        finalFilter['createdBy._id'] = user._id;
    }
    
    const totalItems = (await this.jobModel.find(finalFilter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let defaultPopulation = [
        { path: 'company', select: 'name logo' },
        { path: 'category', select: 'name' },
        { path: 'skills', select: 'name' }
    ];

    const result = await this.jobModel.find(finalFilter)
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort as any)
        .select(projection as any)
        .populate(population && population.length > 0 ? population : defaultPopulation)
        .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Không tìm thấy việc làm với ID này.");
    }
    const job = await this.jobModel.findById(id)
        .populate({ path: 'category', select: 'name' })
        .populate({ path: 'skills', select: 'name' })
        .populate({ path: 'company', select: 'name logo' });
        
    if (!job) {
        throw new NotFoundException("Không tìm thấy việc làm với ID này.");
    }
    return job;
  }

  async update(_id: string, updateJobDto: UpdateJobDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
       throw new NotFoundException("Không tìm thấy việc làm với ID này.");
    }
    
    // Không cho phép cập nhật trường hrId để đảm bảo thông báo hoạt động đúng
    const { hrId, ...updateData } = updateJobDto as any;
    
    const updated = await this.jobModel.updateOne(
      { _id },
      {
        ...updateData,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    
    if (updated.matchedCount === 0) {
        throw new NotFoundException(`Không tìm thấy việc làm với ID: ${_id}`);
    }
    
    return {
        statusCode: 200,
        message: "Cập nhật việc làm thành công"
    }
  }



  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
       throw new NotFoundException("Không tìm thấy việc làm với ID này.");
    }
    await this.jobModel.updateOne(
      { _id },
      { 
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    
    const result = await this.jobModel.softDelete({ _id });
    
    if (result.deleted === 0) {
        throw new NotFoundException(`Không tìm thấy hoặc không thể xóa việc làm với ID: ${_id}`);
    }

    return {
        statusCode: 200, 
        message: "Xóa việc làm thành công"
    }
  }
  // jobs/jobs.service.ts
  // Sửa lại findByCompany trong jobs.service.ts
  async findByCompany(companyId: string) {
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
       throw new NotFoundException("Company ID không hợp lệ.");
    }
    console.log(companyId);
    
    const jobs = await this.jobModel.find({
      'company._id': companyId,
      isActive: true,
    })
    .exec();

    return {
      statusCode: 200,
      message: "Lấy danh sách việc làm theo công ty thành công",
      result: jobs
    };
  }

  async findSimilar(id: string, limit: number = 5) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Not found job with id=${id}`);
    }

    const currentJob = await this.jobModel.findById(id).select('skills category').lean();

    if (!currentJob) {
      throw new NotFoundException(`Job with ID "${id}" not found.`);
    }

    const { skills = [], category } = currentJob;

    const query: any = {
      _id: { $ne: id }, // Exclude the current job
      isActive: true, // Only find active jobs
      $or: [
        { skills: { $in: skills } }, // Jobs with at least one matching skill
      ]
    };

    // Only add category match if the current job has a category
    if (category) {
      query.$or.push({ category: category }); // Jobs in the same category
    }
    
    // Find similar jobs
    const similarJobs = await this.jobModel.find(query)
      .limit(limit)
      .select('_id name salary location company') // Select relevant fields
      .populate({
          path: "company", // Populate company details
          select: { _id: 1, name: 1, logo: 1 } // Select specific company fields
      })
      .sort({ createdAt: -1 }) // Sort by newest first (optional)
      .lean() // Use lean for performance if full Mongoose documents aren't needed
      .exec();

    return similarJobs;
  }
  
  // New method to find jobs by skills
  async findBySkills(findJobsBySkillsDto: FindJobsBySkillsDto, currentPage: number, limit: number) {
    const { skills } = findJobsBySkillsDto;
    
    // Convert string IDs to ObjectId
    const skillObjectIds = skills.map(id => new mongoose.Types.ObjectId(id));

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const filter = {
      skills: { $in: skillObjectIds }, // Find jobs containing any of the specified skills
      isActive: true,
      // isDeleted: false // soft-delete plugin usually handles this implicitly
    };

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ updatedAt: -1 }) // Sort by most recently updated
      .select('_id name salary location company isActive isHot createdAt') // Select fields for listing
      .populate({
        path: "company",
        select: { _id: 1, name: 1, logo: 1 } 
      })
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  // New method to find jobs by category
  async findByCategory(categoryId: string, currentPage: number, limit: number) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new NotFoundException("Category ID không hợp lệ.");
    }

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const filter = {
      category: new mongoose.Types.ObjectId(categoryId), // Filter by category ObjectId
      isActive: true,
      // isDeleted: false // soft-delete plugin usually handles this implicitly
    };

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ updatedAt: -1 }) // Sort by most recently updated
      .select('_id name salary location company isActive isHot createdAt') // Select fields for listing
      .populate({
        path: "company",
        select: { _id: 1, name: 1, logo: 1 } 
      })
      .populate({ // Also populate category name for context if needed later
        path: "category",
        select: { name: 1 }
      })
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  // Helper function to escape special regex characters
  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async search(name?: string, location?: string, currentPage?: number, limit?: number, qs?: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = ((currentPage ?? 1) - 1) * (limit ?? 10);
    let defaultLimit = limit ?? 10;

    // Build the final search query first
    const searchQuery: mongoose.FilterQuery<JobDocument> = {
       ...filter,
       isActive: true // Ensure only active jobs are searched by default
    };

    if (name) {
      // Escape special regex characters to ensure proper matching
      const escapedName = this.escapeRegExp(name);
      searchQuery.name = { $regex: escapedName, $options: 'i' };
    }

    if (location && location !== '') {
      searchQuery.location = location;
    }

    console.log('Final search query:', searchQuery);

    // Calculate total items based on the FINAL searchQuery
    const totalItems = await this.jobModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Define default population if not provided by qs
    let defaultPopulation = [
        { path: 'company', select: 'name logo' },
        { path: 'category', select: 'name' },
        { path: 'skills', select: 'name' }
    ];

    const result = await this.jobModel.find(searchQuery)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      // Use provided population or default
      .populate(population && population.length > 0 ? population : defaultPopulation)
      .select(projection as any)
      .exec();

    console.log('Results found:', result.length);

    return {
      meta: {
        current: currentPage ?? 1,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  // Migration function to update existing jobs with hrId
  async fixMissingHrIds() {
    console.log('[DEBUG] Running fixMissingHrIds migration');
    
    // Lấy tất cả các công việc chưa có hrId
    const jobsWithoutHrId = await this.jobModel.find({ hrId: { $exists: false } });
    console.log(`[DEBUG] Found ${jobsWithoutHrId.length} jobs without hrId`);
    
    // Lấy tất cả các công việc có hrId để kiểm tra
    const jobsWithHrId = await this.jobModel.find({ hrId: { $exists: true } })
      .select('_id name hrId');
    console.log(`[DEBUG] Found ${jobsWithHrId.length} jobs with hrId already set`);
    
    if (jobsWithHrId.length > 0) {
      console.log('[DEBUG] Sample job with hrId:', jobsWithHrId[0]);
    }
    
    let updated = 0;
    let failed = 0;
    
    // Cập nhật các công việc với hrId từ trường createdBy._id
    for (const job of jobsWithoutHrId) {
      console.log(`[DEBUG] Processing job: ${job._id}, name: ${job.name}`);
      
      if (job.createdBy && job.createdBy._id) {
        console.log(`[DEBUG] Setting hrId to ${job.createdBy._id} for job ${job._id}`);
        await this.jobModel.updateOne(
          { _id: job._id },
          { $set: { hrId: job.createdBy._id } }
        );
        updated++;
      } else {
        console.log(`[DEBUG] No createdBy._id found for job ${job._id}`);
        failed++;
      }
    }
    
    return {
      message: `Đã cập nhật ${updated} công việc, ${failed} công việc thất bại`,
      updatedJobs: updated,
      failedJobs: failed
    };
  }
}
