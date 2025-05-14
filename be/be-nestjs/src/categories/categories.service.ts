import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ListCategoriesDto } from './dto/list-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: SoftDeleteModel<CategoryDocument>
  ) { }

  async create(createCategoryDto: CreateCategoryDto, user: IUser) {
    const { name } = createCategoryDto;

    // Check if category name already exists (case-insensitive)
    const isExist = await this.categoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (isExist) {
      throw new BadRequestException(`Danh mục với tên "${name}" đã tồn tại.`);
    }

    const newCategory = await this.categoryModel.create({
      name,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    return {
      _id: newCategory?._id,
      createdAt: newCategory?.createdAt
    };
  }

  // category.service.ts
  // async findAll(dto: ListCategoriesDto) {
  //   const cur = +dto.current || 1;
  //   const size = +dto.pageSize || 10;

  //   const match: any = { isDeleted: { $ne: true } };
  //   if (dto.name) match.name = { $regex: dto.name, $options: 'i' };
  //   if (dto.description) match.description = { $regex: dto.description, $options: 'i' };

  //   const pipeline: any[] = [
  //     { $match: match },
  //     /* ⭐ join skills để lấy recruitCount */
  //     {
  //       $lookup: {
  //         from: 'skills',
  //         localField: 'skills',
  //         foreignField: '_id',
  //         as: 'skills',
  //       },
  //     },

  //     {
  //       $addFields: {
  //         recruitCount: { $sum: '$skills.recruitCount' },
  //       },
  //     },
  //     { $sort: { createdAt: -1 } },
  //   ];

  //   // total
  //   const [{ total = 0 } = {}] = await this.categoryModel
  //     .aggregate([...pipeline, { $count: 'total' }]);

  //   // paging
  //   pipeline.push({ $skip: (cur - 1) * size }, { $limit: size });

  //   const result = await this.categoryModel.aggregate(pipeline);

  //   return { result, meta: { current: cur, pageSize: size, total, pages: Math.ceil(total / size) } };
  // }
  async findAll(dto: ListCategoriesDto) {
    const cur = Number(dto.current) || 1;
    const size = Number(dto.pageSize) || 10;

    // 1. Match cơ bản
    const match: any = { isDeleted: { $ne: true } };
    if (dto.name) match.name = { $regex: dto.name, $options: 'i' };
    if (dto.description) match.description = { $regex: dto.description, $options: 'i' };

    // 2. Xây pipeline
    const pipeline: any[] = [
      { $match: match },

      // 2.1. Join skills
      {
        $lookup: {
          from: 'skills',
          localField: 'skills',
          foreignField: '_id',
          as: 'skills',
        },
      },
    ];

    // 2.2. Nếu có dto.skill, lọc những category có ít nhất một skill khớp tên
    if (dto.skill) {
      pipeline.push({
        $match: {
          'skills.name': { $regex: dto.skill, $options: 'i' },
        },
      });
    }

    // 2.3. Tính recruitCount và sort
    pipeline.push(
      {
        $addFields: {
          recruitCount: { $sum: '$skills.recruitCount' },
        },
      },
      { $sort: { createdAt: -1 } },
    );

    // 3. Đếm tổng
    const [{ total = 0 } = {}] = await this.categoryModel.aggregate([
      ...pipeline,
      { $count: 'total' },
    ]);

    // 4. Pagination
    pipeline.push(
      { $skip: (cur - 1) * size },
      { $limit: size },
    );

    const result = await this.categoryModel.aggregate(pipeline);
    return {
      result,
      meta: {
        current: cur,
        pageSize: size,
        total,
        pages: Math.ceil(total / size),
      },
    };
  }



  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy danh mục.");
    }
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new BadRequestException("Không tìm thấy danh mục với ID cung cấp.");
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID danh mục không hợp lệ.");
    }

    const { name } = updateCategoryDto;

    // If name is being updated, check for conflicts (case-insensitive, excluding self)
    if (name) {
      const isExist = await this.categoryModel.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      if (isExist) {
        throw new BadRequestException(`Danh mục với tên "${name}" đã tồn tại.`);
      }
    }

    const updated = await this.categoryModel.updateOne(
      { _id: id },
      {
        ...updateCategoryDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    if (updated.modifiedCount === 0) {
      // Optional: throw error if nothing was modified, or just return success
    }
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID danh mục không hợp lệ.");
    }
    await this.categoryModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.categoryModel.softDelete({
      _id: id
    });
  }
} 