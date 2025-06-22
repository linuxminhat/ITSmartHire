import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { userInfo } from 'os';
import { CompaniesService } from 'src/companies/companies.service';
import { FindJobsBySkillsDto } from './dto/find-jobs-by-skills.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @ResponseMessage("Create a new job")
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Public()
  @Get('search')
  @ResponseMessage("Search jobs by name and location")
  search(
    @Query('name') name?: string,
    @Query('location') location?: string,
    @Query("current") currentPage?: string,
    @Query("pageSize") limit?: string,
    @Query() qs?: string) {

    //Data type conversion
    const current = parseInt(currentPage) || 1;
    const size = parseInt(limit) || 10;

    return this.jobsService.search(name, location, current, size, qs);
  }

  @Public()
  @Get('public')
  @ResponseMessage("Fetch all jobs for public display (no HR filter)")
  findAllPublic(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string
  ) {
    return this.jobsService.findAllPublic(+currentPage, +limit, qs);
  }

  @Get()
  @ResponseMessage("Fetch all jobs with paginate (with HR filter)")
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs, user);
  }

  @Get(':id')
  @Public()
  @ResponseMessage("Fetch jobs by id")
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update a job")
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a job")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }

  @Public()
  @Get('by-company/:companyId')
  @ResponseMessage("Fetch jobs by company")
  findByCompany(@Param('companyId') companyId: string) {
    return this.jobsService.findByCompany(companyId);
  }

  @Get(':id/similar')
  @Public()
  @ResponseMessage("Fetch similar jobs by id")
  findSimilar(@Param('id') id: string, @Query('limit') limit: string) {
    return this.jobsService.findSimilar(id, +limit || 5);
  }

  @Post('/by-skills')
  @Public()
  @ResponseMessage("Fetch jobs by skills with pagination")
  findBySkills(
    @Body() findJobsBySkillsDto: FindJobsBySkillsDto,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
  ) {
    const current = +currentPage || 1;
    const pageSize = +limit || 10;
    return this.jobsService.findBySkills(findJobsBySkillsDto, current, pageSize);
  }

  @Get('/by-category/:categoryId')
  @Public()
  @ResponseMessage("Fetch jobs by category with pagination")
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
  ) {
    const current = +currentPage || 1;
    const pageSize = +limit || 10;
    return this.jobsService.findByCategory(categoryId, current, pageSize);
  }

  @Post('fix-hr-ids')
  @Public()
  @ResponseMessage('Fix missing hrId fields')
  fixMissingHrIds() {
    return this.jobsService.fixMissingHrIds();
  }
}
