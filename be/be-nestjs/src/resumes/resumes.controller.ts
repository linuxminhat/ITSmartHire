import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';


@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService
  ) { }

  //Create User Resume 
  @Post()
  @ResponseMessage("Create a new resume")
  //@User() : luu vet ai la nguoi tao
  create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createUserCvDto, user);
  }

  //Get Resume by User
  @Post('by-user')
  @ResponseMessage("Get resume by user")
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }
  //Find All Resume 
  @Get()
  @ResponseMessage("Fetch all resumes with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("Fetch a resume by id")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);

  }

  //Update status of resume 
  @Patch(':id')
  @ResponseMessage("Update status resume")
  updateStatus(@Param('id') id: string, @Body("status") status: string, @User() user: IUser) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a resume by id")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
