import { Controller, Post, Body, UseGuards, Get, Param, Query, Patch } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Nộp đơn ứng tuyển thành công!')
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @User() user: IUser
  ) {
    //authorization 
    if (user.role?.name !== 'USER' && user.role?.name !== 'ADMIN') {
      throw new Error('Chỉ người dùng mới có thể ứng tuyển.');
    }
    return this.applicationsService.create(createApplicationDto, user);
  }

  @Get('by-job/:jobId')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Lấy danh sách ứng viên theo công việc thành công!')
  findByJob(
    @Param('jobId') jobId: string,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
    @User() user: IUser
  ) {


    const current = parseInt(currentPage) || 1;
    const size = parseInt(limit) || 10;
    return this.applicationsService.findByJob(jobId, current, size, qs);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Cập nhật trạng thái ứng tuyển thành công!')
  updateStatus(
    @Param('id') id: string,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    @User() user: IUser
  ) {

    return this.applicationsService.updateStatus(id, updateApplicationStatusDto, user);
  }

  @Get('by-user')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Lấy danh sách việc làm đã ứng tuyển thành công!')
  findMyApplications(
    @User() user: IUser,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    const current = parseInt(currentPage) || 1;
    const size = parseInt(limit) || 10;

    return this.applicationsService.findByUser(user._id, current, size, qs);
  }
} 