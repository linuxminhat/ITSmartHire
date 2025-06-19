import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { IUser } from 'src/users/users.interface';
import mongoose, { Types } from 'mongoose';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import aqp from 'api-query-params';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Model } from 'mongoose';
import { HRNotificationsService } from 'src/hr-notifications/hr-notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private applicationModel: SoftDeleteModel<ApplicationDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly hrNotificationsService: HRNotificationsService,
  ) { }

  async create(createApplicationDto: CreateApplicationDto, user: IUser) {
    //Destructuring 
    const { jobId, cvUrl } = createApplicationDto;

    const existingApplication = await this.applicationModel.findOne({
      userId: user._id,
      jobId: jobId,
      cvUrl: cvUrl,
    });

    if (existingApplication) {
      throw new BadRequestException('Bạn đã ứng tuyển vào công việc này với CV này rồi.');
    }

    console.log(`[DEBUG] Creating application for User ${user.name} (${user._id}), Job ID: ${jobId}`);

    const newApp = await this.applicationModel.create({
      userId: user._id,
      jobId: jobId,
      cvUrl: cvUrl,
      status: 'pending',
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    console.log(`[DEBUG] Application created: ${newApp._id}`);

    //Query job information matching jobId.
    const job = await this.jobModel
      .findById(jobId)
      .select('hrId name')
      .lean<{
        _id: Types.ObjectId;
        hrId: Types.ObjectId;
        name: string;
      }>();

    console.log(`[DEBUG] Retrieved job:`, job);

    if (job?.hrId) {
      console.log(`[DEBUG] Found hrId: ${job.hrId}, sending notification`);

      await this.hrNotificationsService.createHRNotification(
        newApp._id.toString(),
        job._id.toString(),
        job.hrId.toString(),
        job.name,
        user.name,
        user.email,
      );

      console.log(`[DEBUG] Notification sent to HR (${job.hrId})`);
    } else {
      console.log(`[DEBUG] No hrId found for job ${jobId}, notification not sent`);
    }

    return {
      _id: newApp._id,
      createdAt: newApp.createdAt,
      message: 'Nộp đơn ứng tuyển thành công!'
    };
  }

  async findByJob(jobId: string, currentPage: number, limit: number, qs: string) {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      throw new BadRequestException('Job ID không hợp lệ.');
    }

    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;

    const queryFilter = { ...filter, jobId: new mongoose.Types.ObjectId(jobId) };

    const totalItems = await this.applicationModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let defaultPopulation = [
      { path: 'userId', select: '_id name email' }

    ];

    const result = await this.applicationModel.find(queryFilter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population && population.length > 0 ? population : defaultPopulation)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto, hr: IUser) {

    await this.applicationModel.updateOne(
      { _id: id },
      { status: dto.status, updatedBy: { _id: hr._id, email: hr.email } },
    );


    const application = await this.applicationModel
      .findById(id)
      .populate({ path: 'jobId', populate: { path: 'company', select: 'name' } });

    if (application) {
      const job = application.jobId as any;
      const companyName = job.company?.name ?? 'Nhà tuyển dụng';

      //Notification firebase
      await this.notificationsService.createNotificationForApplication(
        application._id.toString(),
        job._id.toString(),
        application.userId.toString(),
        companyName,
        dto.status,
      );

      //Push notification
      await this.notificationsService.pushToUserDevices(
        application.userId.toString(),
        {
          title: 'Cập nhật hồ sơ ứng tuyển',
          body: `Hồ sơ của bạn gửi tới ${companyName} đã chuyển sang trạng thái ${dto.status}.`,
        },
      );
    }


    return { message: 'Cập nhật trạng thái ứng tuyển thành công.' };
  }


  async findByUser(userId: string, currentPage: number, limit: number, qs: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('User ID không hợp lệ.');
    }

    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (currentPage - 1) * limit;
    let defaultLimit = limit ? limit : 10;

    // Filter by userId
    const queryFilter = { ...filter, userId: new mongoose.Types.ObjectId(userId) };

    const totalItems = await this.applicationModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Default population to get Job details
    let defaultPopulation = [
      {
        path: 'jobId',
        select: '_id name location salary company isActive isHot', // Select needed job fields
        populate: { // Populate company within the job
          path: 'company',
          select: '_id name logo'
        }
      }
    ];

    const result = await this.applicationModel.find(queryFilter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any) // Apply sort, default might be -createdAt
      .populate(population && population.length > 0 ? population : defaultPopulation)
      .select(projection as any) // Select specific application fields if needed
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems
      },
      result
    };
  }

} 