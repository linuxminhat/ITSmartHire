import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) { }

  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    return this.blogsService.create(createBlogDto, req.user._id);
  }

  @Get()
  async findAll(
    @Query('current') current = '1',
    @Query('pageSize') pageSize = '12',
    @Query('sort') sort = '-createdAt',
    @Query('search') search?: string,
  ) {
    return this.blogsService.findAll({
      current: +current,
      pageSize: +pageSize,
      sort,
      search,
    });
  }

  @Get('tags/:tags')
  findByTags(@Param('tags') tags: string) {
    const tagArray = tags.split(',');
    return this.blogsService.findByTags(tagArray);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    await this.blogsService.incrementViews(id);
    return this.blogsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  @Get('tag/:tag')
  findByTag(@Param('tag') tag: string) {
    return this.blogsService.findByTags([tag]);
  }
} 