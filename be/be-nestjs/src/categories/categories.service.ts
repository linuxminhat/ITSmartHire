import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

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

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.categoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Add case-insensitive search for name if present in filter
    if (filter.name) {
        filter.name = { $regex: new RegExp(filter.name, 'i') };
    }

    const result = await this.categoryModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
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