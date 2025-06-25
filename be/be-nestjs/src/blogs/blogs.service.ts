import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>
  ) { }

  async create(createBlogDto: CreateBlogDto, userId: string): Promise<Blog> {
    const createdBlog = new this.blogModel({
      ...createBlogDto,
      author: userId
    });
    return createdBlog.save();
  }

  async findAll(query: any = {}): Promise<any> {
    const {
      current = 1,
      pageSize = 6,
      sort = '-createdAt',
      search,
      tag,
      author,
      ...rest
    } = query;

    const conditions: any = { isDeleted: false, ...rest };
    if (search) {
      conditions.title = { $regex: search, $options: 'i' };
    }
    if (tag) {
      conditions.tags = { $in: [tag] };
    }
    if (author) {
      conditions.author = author;
    }
    const sortObject: Record<string, 1 | -1> = {};
    if (sort.startsWith('-')) {
      sortObject[sort.slice(1)] = -1;
    } else {
      sortObject[sort] = 1;
    }
    const skip = (Number(current) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    const total = await this.blogModel.countDocuments(conditions);
    const result = await this.blogModel.find(conditions)
      .populate('author', 'name email')
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      meta: {
        current: Number(current),
        pageSize: limit,
        pages: Math.ceil(total / limit),
        total,
      },
      result,
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

  async update(id: string, updateBlogDto: UpdateBlogDto, user: any): Promise<Blog> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog || blog.isDeleted) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    if (user.role.name === 'HR' && blog.author.toString() !== user._id.toString()) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài viết này');
    }
    // Cập nhật các trường được cung cấp
    Object.assign(blog, updateBlogDto);

    // Lưu thay đổi
    return blog.save();
  }


  async remove(id: string, user: any): Promise<void> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog || blog.isDeleted) {
      throw new NotFoundException(`Blog với ID ${id} không tồn tại`);
    }

    if (
      user.role?.name === 'HR' &&
      blog.author.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xoá bài viết này',
      );
    }
    blog.isDeleted = true;
    // blog.deletedAt = new Date();
    await blog.save();
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