import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

import { Roles } from '../decorator/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('top-skills')
  async getTopSkills() {
    return this.dashboardService.getTopSkills();
  }

  @Get('top-companies')
  async getTopCompanies() {
    return this.dashboardService.getTopCompanies();
  }

  @Get('top-categories')
  async getTopCategories() {
    return this.dashboardService.getTopCategories();
  }

  @Get('user-growth')
  async getUserGrowth() {
    return this.dashboardService.getUserGrowth();
  }
}