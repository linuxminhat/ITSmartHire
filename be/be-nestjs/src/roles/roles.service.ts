import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive } = createRoleDto;

    const isExist = await this.roleModel.findOne({ name });
    if (isExist) {
      throw new BadRequestException(`Role với name="${name}" đã tồn tại !!!`)
    }

    //If not error create a new Permission 
    const newRole = await this.roleModel.create({
      name, description, isActive,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newRole?.id,
      createdAt: newRole?.createdAt
    };
  }

  // async findAll(currentPage: number, limit: number, qs: string) {
  //   const { filter, sort, population, projection } = aqp(qs);
  //   delete filter.current;
  //   delete filter.pageSize;

  //   let offset = (+currentPage - 1) * (+limit);
  //   let defaultLimit = +limit ? +limit : 10;

  //   const totalItems = (await this.roleModel.find(filter)).length;
  //   const totalPages = Math.ceil(totalItems / defaultLimit);

  //   const result = await this.roleModel.find(filter)
  //     .skip(offset)
  //     .limit(defaultLimit)
  //     .sort(sort as any)
  //     .populate(population)
  //     .select(projection as any)
  //     .exec();

  //   return {
  //     meta: {
  //       current: currentPage,
  //       pageSize: limit,
  //       pages: totalPages,
  //       total: totalItems
  //     },
  //     result
  //   }
  // }
  async findAll(currentPage = 1, limit = 10, qs = '') {
    const { filter = {}, sort = {}, projection = {} } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const page = Number(currentPage) || 1;
    const pageSize = Number(limit) || 10;
    const skip = (page - 1) * pageSize;

    const totalItems = await this.roleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const sortStage = Object.keys(sort).length ? sort : { createdAt: -1 };
    const pipeline: any[] = [
      { $match: { isDeleted: { $ne: true } } },
      { $match: filter },
      { $sort: sortStage },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'role',
          as: 'users',
        },
      },
      { $addFields: { userCount: { $size: '$users' } } },
      { $project: { users: 0, ...projection } }, // ẩn mảng users
      { $skip: skip },
      { $limit: pageSize },
    ];

    const result = await this.roleModel.aggregate(pipeline);

    return {
      meta: {
        current: page,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Not Found A Role")
    }

    return await this.roleModel.findById(id);
  }

  async update(_id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Not Found Permission")
    }

    const { name, description, isActive } = updateRoleDto;

    const updated = await this.roleModel.updateOne(
      { _id },
      {
        name, description, isActive,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.roleModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException("Không thể xóa role admin !!!!");
    }

    await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.roleModel.softDelete({
      _id: id
    })
  }
}
