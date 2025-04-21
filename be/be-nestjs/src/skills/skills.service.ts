import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) 
    private skillModel: SoftDeleteModel<SkillDocument>
  ) { }

  async create(createSkillDto: CreateSkillDto, user: IUser) {
    const { name } = createSkillDto;

    // Check if skill name already exists (case-insensitive)
    const isExist = await this.skillModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (isExist) {
      throw new BadRequestException(`Kỹ năng với tên "${name}" đã tồn tại.`);
    }

    const newSkill = await this.skillModel.create({
      name,
      // description, // Add if description is included
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });

    return {
      _id: newSkill?._id,
      createdAt: newSkill?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.skillModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Add case-insensitive search for name if present in filter
    if (filter.name) {
        filter.name = { $regex: new RegExp(filter.name, 'i') };
    }

    const result = await this.skillModel.find(filter)
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
      throw new BadRequestException("Không tìm thấy kỹ năng.");
    }
    const skill = await this.skillModel.findById(id);
    if (!skill) {
        throw new BadRequestException("Không tìm thấy kỹ năng với ID cung cấp.");
    }
    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("ID kỹ năng không hợp lệ.");
    }

    const { name } = updateSkillDto;

    // If name is being updated, check for conflicts (case-insensitive, excluding self)
    if (name) {
        const isExist = await this.skillModel.findOne({
             name: { $regex: new RegExp(`^${name}$`, 'i') }, 
             _id: { $ne: id } 
        });
        if (isExist) {
            throw new BadRequestException(`Kỹ năng với tên "${name}" đã tồn tại.`);
        }
    }

    const updated = await this.skillModel.updateOne(
      { _id: id },
      {
        ...updateSkillDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );

    if (updated.modifiedCount === 0) {
         // Optional: throw error if nothing was modified, or just return success
         // Could mean the skill didn't exist or data was the same
    }

    return updated; // Consider returning the updated document instead if needed
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestException("ID kỹ năng không hợp lệ.");
    }

    await this.skillModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.skillModel.softDelete({
      _id: id
    });
  }
} 