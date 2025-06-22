import { Delete, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Types } from 'mongoose';
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
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    // Build the search filter
    let finalFilter: any = {
      isDeleted: false
    };

    // Add HR filter if applicable
    if (user?.role?.name === 'HR') {
      finalFilter['createdBy._id'] = user._id;
    }

    const searchConditions = [];

    // Handle name/search
    if (filter.name || filter.search) {
      const searchTerm = filter.name || filter.search;
      if (searchTerm?.trim()) {
        searchConditions.push({
          name: { $regex: this.escapeRegExp(searchTerm.trim()), $options: 'i' }
        });
      }
    }

    // Handle category search
    if (filter.category?.trim()) {
      const id = new Types.ObjectId(filter.category.trim());
      searchConditions.push({ category: id });
    }

    // Handle skills search
    if (filter.skill?.trim()) {
      const id = new Types.ObjectId(filter.skill.trim());
      searchConditions.push({ skills: id });          // 1 skill
    }

    // Handle company search
    if (filter.company?.trim()) {
      const idStr = filter.company.trim();
      const idObj = new Types.ObjectId(idStr);

      searchConditions.push({
        $or: [
          { 'company._id': idObj },
          { 'company._id': idStr }
        ]
      });
    }

    // Handle location search
    if (filter.location?.trim()) {
      searchConditions.push({
        location: { $regex: this.escapeRegExp(filter.location.trim()), $options: 'i' }
      });
    }

    // Combine all search conditions with AND if there are any conditions
    if (searchConditions.length > 0) {
      finalFilter.$and = searchConditions;
    }

    // Remove unused filter properties
    delete filter.name;
    delete filter.search;
    delete filter.category;
    delete filter.skill;
    delete filter.company;
    delete filter.location;

    // Add remaining filter properties
    finalFilter = { ...finalFilter, ...filter };

    console.log('Search conditions:', JSON.stringify(searchConditions, null, 2));
    console.log('Final filter:', JSON.stringify(finalFilter, null, 2));

    // First populate the references
    const populatedQuery = this.jobModel.find(finalFilter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate([
        {
          path: 'category',
          select: 'name',
        },
        {
          path: 'skills',
          select: 'name',
        },
        {
          path: 'company',
          select: 'name logo',
        }
      ]);

    const [totalItems, result] = await Promise.all([
      this.jobModel.countDocuments(finalFilter),
      populatedQuery.exec()
    ]);

    const totalPages = Math.ceil(totalItems / defaultLimit);

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

  //using in Job Detail, for similar job in Skills and Category 
  async findSimilar(id: string, limit: number = 5) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Not found job with id=${id}`);
    }

    //finding current job through id, get skill and category
    const currentJob = await this.jobModel.findById(id).select('skills category').lean();

    if (!currentJob) {
      throw new NotFoundException(`Job with ID "${id}" not found.`);
    }

    const { skills = [], category } = currentJob;

    const query: any = {
      _id: { $ne: id },
      isActive: true,
      $or: [
        { skills: { $in: skills } },
      ]
    };

    if (category) {
      query.$or.push({ category: category });
    }

    const similarJobs = await this.jobModel.find(query)
      .limit(limit)
      .select('_id name salary location company')
      .populate({
        path: "company",
        select: { _id: 1, name: 1, logo: 1 }
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return similarJobs;
  }

  // New method to find jobs by skills
  async findBySkills(findJobsBySkillsDto: FindJobsBySkillsDto, currentPage: number, limit: number) {
    const { skills } = findJobsBySkillsDto;

    // Convert string IDs to ObjectId cause in MongoDB is ObjectID
    const skillObjectIds = skills.map(id => new mongoose.Types.ObjectId(id));

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const filter = {
      skills: { $in: skillObjectIds },
      isActive: true,
    };

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ updatedAt: -1 })
      .select('_id name salary location company isActive isHot createdAt')
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

  async findByCategory(categoryId: string, currentPage: number, limit: number) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new NotFoundException("Category ID không hợp lệ.");
    }

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    const filter = {
      category: new mongoose.Types.ObjectId(categoryId),
      isActive: true,
    };

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ updatedAt: -1 })
      .select('_id name salary location company isActive isHot createdAt')
      .populate({
        path: "company",
        select: { _id: 1, name: 1, logo: 1 }
      })
      .populate({
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

  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async search(name?: string, location?: string, currentPage?: number, limit?: number, qs?: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    delete filter.name;
    delete filter.location;

    let offset = ((currentPage ?? 1) - 1) * (limit ?? 10);
    let defaultLimit = limit ?? 10;

    const searchQuery: mongoose.FilterQuery<JobDocument> = {
      ...filter,
      isActive: true,
      isDeleted: false
    };

    //filter by name using regex
    if (name) {
      const escapedName = this.escapeRegExp(name);
      searchQuery.name = { $regex: escapedName, $options: 'i' };
    }

    //filter by location using regex (như findAll method)
    if (location && location !== '') {
      const escapedLocation = this.escapeRegExp(location);
      searchQuery.location = { $regex: escapedLocation, $options: 'i' };
    }

    console.log('Final search query:', searchQuery);

    const totalItems = await this.jobModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let defaultPopulation = [
      { path: 'company', select: 'name logo' },
      { path: 'category', select: 'name' },
      { path: 'skills', select: 'name' }
    ];

    const result = await this.jobModel.find(searchQuery)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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

  async fixMissingHrIds() {
    console.log('[DEBUG] Running fixMissingHrIds migration');

    const jobsWithoutHrId = await this.jobModel.find({ hrId: { $exists: false } });
    console.log(`[DEBUG] Found ${jobsWithoutHrId.length} jobs without hrId`);

    const jobsWithHrId = await this.jobModel.find({ hrId: { $exists: true } })
      .select('_id name hrId');
    console.log(`[DEBUG] Found ${jobsWithHrId.length} jobs with hrId already set`);

    if (jobsWithHrId.length > 0) {
      console.log('[DEBUG] Sample job with hrId:', jobsWithHrId[0]);
    }

    let updated = 0;
    let failed = 0;
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
