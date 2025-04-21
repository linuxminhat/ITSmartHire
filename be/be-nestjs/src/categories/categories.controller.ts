import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ResponseMessage("Tạo mới Danh mục thành công")
  @UseGuards(JwtAuthGuard)
  create(@Body() createCategoryDto: CreateCategoryDto, @User() user: IUser) {
    return this.categoriesService.create(createCategoryDto, user);
  }

  @Get()
  @Public() // Make category listing public
  @ResponseMessage("Lấy danh sách Danh mục thành công")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.categoriesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @Public() // Make category detail public
  @ResponseMessage("Lấy thông tin Danh mục thành công")
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Cập nhật Danh mục thành công")
  @UseGuards(JwtAuthGuard)
  update(
      @Param('id') id: string, 
      @Body() updateCategoryDto: UpdateCategoryDto, 
      @User() user: IUser
    ) {
    return this.categoriesService.update(id, updateCategoryDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Xóa Danh mục thành công")
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.categoriesService.remove(id, user);
  }
} 