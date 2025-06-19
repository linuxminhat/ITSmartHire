import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) { }

  @Post()
  @ResponseMessage("Tạo mới Kỹ năng thành công")
  @UseGuards(JwtAuthGuard)
  create(@Body() createSkillDto: CreateSkillDto, @User() user: IUser) {
    return this.skillsService.create(createSkillDto, user);
  }

  @Get()
  @Public()
  @ResponseMessage("Lấy danh sách Kỹ năng thành công")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.skillsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public()
  @ResponseMessage("Lấy thông tin Kỹ năng thành công")
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Cập nhật Kỹ năng thành công")
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @User() user: IUser
  ) {
    return this.skillsService.update(id, updateSkillDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Xóa Kỹ năng thành công")
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.skillsService.remove(id, user);
  }
} 