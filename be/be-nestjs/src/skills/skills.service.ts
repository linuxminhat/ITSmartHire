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

  async create(dto: CreateSkillDto, user: IUser) {
    const { name, category, description = '', isActive = true } = dto;
    //Clean up skill names to avoid regex injection errors.
    const regexSafe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const isExist = await this.skillModel.findOne({ name: { $regex: new RegExp(`^${regexSafe}$`, 'i') } });
    if (isExist) throw new BadRequestException(`Kỹ năng "${name}" đã tồn tại.`);

    const newSkill = await this.skillModel.create({
      name,
      category,
      description,
      isActive,
      createdBy: { _id: user._id, email: user.email },
    });

    return { _id: newSkill._id, createdAt: newSkill.createdAt };
  }


  async findAll(currentPage = 1, limit = 10, qs = '') {
    //filter, sort, count job per skills 
    //Use the api-query-params (aqp) library to convert query string to MongoDB object 
    const { filter = {}, sort = {}, projection = {} } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // (RegExp) is not case sensitive. Ex : Java, java, JAVA
    if (filter.name) {
      filter.name = { $regex: new RegExp(filter.name, 'i') };
    }

    const page = Number(currentPage) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (page - 1) * pageSize;

    //Aggregation Pipeline
    const pipeline: any[] = [
      { $match: filter },

      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'skills',
          as: 'jobRefs',
        },
      },
      { $addFields: { recruitCount: { $size: '$jobRefs' } } },
      { $project: { jobRefs: 0, ...projection } },

      // sort
      { $sort: Object.keys(sort).length ? sort : { createdAt: -1 } },

      // page pagination
      { $skip: skip },
      { $limit: pageSize },
    ];
    const [result, total] = await Promise.all([
      this.skillModel.aggregate(pipeline),
      this.skillModel.countDocuments(filter),
    ]);

    return {
      meta: {
        current: page,
        pageSize,
        pages: Math.ceil(total / pageSize),
        total,
      },
      result,
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

  async update(id: string, dto: UpdateSkillDto, user: IUser) {
    const { name } = dto;
    if (name) {
      //check if existed or not 
      const regexSafe = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const dup = await this.skillModel.findOne({
        name: { $regex: new RegExp(`^${regexSafe}$`, 'i') },
        _id: { $ne: id },
      });
      if (dup) throw new BadRequestException(`Kỹ năng "${name}" đã tồn tại.`);
    }

    return this.skillModel.updateOne(
      { _id: id },
      { ...dto, updatedBy: { _id: user._id, email: user.email } },
    );
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