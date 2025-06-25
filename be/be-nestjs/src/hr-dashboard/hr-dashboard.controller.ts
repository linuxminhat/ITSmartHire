import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth-guards';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { User } from '../decorator/customize';
import { IUser } from '../users/users.interface';
import { HrDashboardService } from './hr-dashboard.service';

@Controller('hr-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HR')
export class HrDashboardController {
  constructor(private readonly hrDashboardService: HrDashboardService) {}

  @Get('stats')
  getStats(@User() user: IUser) {
    return this.hrDashboardService.getStats(user);
  }

  @Get('top-positions')
  getTopPositions(@User() user: IUser) {
    return this.hrDashboardService.getTopPositions(user);
  }

  @Get('application-status')
  getApplicationStatus(@User() user: IUser) {
    return this.hrDashboardService.getApplicationStatus(user);
  }

  @Get('job-growth')
  getJobGrowth(@User() user: IUser) {
    return this.hrDashboardService.getJobGrowth(user);
  }

  @Get('interview-growth')
  getInterviewGrowth(@User() user: IUser) {
    return this.hrDashboardService.getInterviewGrowth(user);
  }
}
