import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>
  ) {}

  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {
    const createdBlog = new this.blogModel({
      ...createBlogDto,
      author: userId
    });
    return createdBlog.save();
  }

  async findAll(query: any = {}): Promise<any> {
    const { current = 1, pageSize = 10, sort = '-createdAt', ...rest } = query;

    // Xử lý điều kiện tìm kiếm
    const conditions = { isDeleted: false, ...rest };
    
    // Xử lý sort
    const sortObject = {};
    if (sort.startsWith('-')) {
      sortObject[sort.slice(1)] = -1;
    } else {
      sortObject[sort] = 1;
    }

    // Tính skip cho phân trang
    const skip = (Number(current) - 1) * Number(pageSize);

    // Đếm tổng số bản ghi thỏa mãn điều kiện
    const total = await this.blogModel.countDocuments(conditions);

    // Lấy dữ liệu theo trang
    const result = await this.blogModel.find(conditions)
      .populate('author', 'name email')
      .sort(sortObject)
      .skip(skip)
      .limit(Number(pageSize))
      .exec();

    return {
      meta: {
        current: Number(current),
        pageSize: Number(pageSize),
        pages: Math.ceil(total / Number(pageSize)),
        total
      },
      result
    };
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogModel.findOne({ _id: id, isDeleted: false })
      .populate('author', 'name email')
      .exec();
    
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog || blog.isDeleted) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // Cập nhật các trường được cung cấp
    Object.assign(blog, updateBlogDto);
    
    // Lưu thay đổi
    return blog.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
  }

  async incrementViews(id: string): Promise<void> {
    await this.blogModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { views: 1 } }
    ).exec();
  }

  async findByTags(tags: string[]): Promise<Blog[]> {
    return this.blogModel.find({
      tags: { $in: tags },
      isDeleted: false
    })
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .exec();
  }
} 