import { Controller, Post, Body, UseGuards, Get, Param, Query, Patch } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ResponseMessage, User } from 'src/decorator/customize'; // Assuming User decorator exists
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards'; // Correct the import path for JwtAuthGuard
// Import RolesGuard and Roles decorator if you have role-based access control
// import { RolesGuard } from 'src/auth/roles.guard'; 
// import { Roles } from 'src/decorator/roles.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Protect this route
  @ResponseMessage('Nộp đơn ứng tuyển thành công!')
  create(
      @Body() createApplicationDto: CreateApplicationDto,
      @User() user: IUser // Get the logged-in user from the decorator
    ) {
        // Basic role check - could be enhanced with RolesGuard if needed
        if (user.role?.name !== 'USER' && user.role?.name !== 'ADMIN') { // Example: Allow standard users and maybe admin?
            // Or throw ForbiddenException if using RolesGuard
            throw new Error('Chỉ người dùng mới có thể ứng tuyển.');
        }
    return this.applicationsService.create(createApplicationDto, user);
  }

  @Get('by-job/:jobId')
  @UseGuards(JwtAuthGuard) // Protect this route
  // Add role guard if needed: @UseGuards(JwtAuthGuard, RolesGuard)
  // Add roles decorator if needed: @Roles('ADMIN', 'HR') 
  @ResponseMessage('Lấy danh sách ứng viên theo công việc thành công!')
  findByJob(
    @Param('jobId') jobId: string,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string, // For potential future filtering/sorting
    @User() user: IUser // Get user to potentially check roles if not using RolesGuard
  ) {
    // Example basic role check if not using RolesGuard
    // if (user.role?.name !== 'ADMIN' && user.role?.name !== 'HR') {
    //   throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này.');
    // }
    
    const current = parseInt(currentPage) || 1;
    const size = parseInt(limit) || 10;
    return this.applicationsService.findByJob(jobId, current, size, qs);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard) // Protect this route
  // Add role guard if needed: @UseGuards(JwtAuthGuard, RolesGuard)
  // Add roles decorator if needed: @Roles('ADMIN', 'HR') 
  @ResponseMessage('Cập nhật trạng thái ứng tuyển thành công!')
  updateStatus(
    @Param('id') id: string,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    @User() user: IUser // Get user for updatedBy field and potentially role check
  ) {
    // Example basic role check if not using RolesGuard
    // if (user.role?.name !== 'ADMIN' && user.role?.name !== 'HR') {
    //   throw new ForbiddenException('Bạn không có quyền thực hiện hành động này.');
    // }
    return this.applicationsService.updateStatus(id, updateApplicationStatusDto, user);
  }

  @Get('by-user') // New endpoint to get applications for the logged-in user
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Lấy danh sách việc làm đã ứng tuyển thành công!')
  findMyApplications(
    @User() user: IUser, // Get logged-in user
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    const current = parseInt(currentPage) || 1;
    const size = parseInt(limit) || 10;
    // Pass the logged-in user's ID to the service method
    return this.applicationsService.findByUser(user._id, current, size, qs);
  }

  // Add GET (by id), DELETE endpoints if needed later
} 