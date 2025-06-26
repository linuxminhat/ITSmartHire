import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company, CompanyDocument } from './schemas/company.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { User } from 'src/decorator/customize';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>) { }

  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const { name, address, latitude, longitude, description, logo, skills, specializationDescription, companyModel, industry, companySize, country, workingTime } = createCompanyDto;
    return this.companyModel.create({
      name, address, latitude, longitude, description, logo, skills, specializationDescription, companyModel, industry, companySize, country, workingTime,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, skip, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    let finalFilter = { ...filter, isDeleted: false };

    const searchFields = ['name', 'address', 'country', 'industry'];
    for (const field of searchFields) {
      if (finalFilter[field] && typeof finalFilter[field] === 'string') {
        finalFilter[field] = {
          $regex: finalFilter[field],
          $options: 'i'
        };
      }
    }

    console.log("Final filter:", finalFilter);

    if (user?.role?.name === 'HR') {
      finalFilter['createdBy._id'] = user._id;
    }

    const totalItems = (await this.companyModel.find(finalFilter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel.find(finalFilter)
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
    }
  }

  async findOne(id: string) {
    const company = await this.companyModel.findById(id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Không tìm thấy công ty với id = ${id} hoặc định dạng ID không hợp lệ`);
    }
    if (!company) {
      throw new NotFoundException(`Company with id = ${id} not found`);
    }

    await company.populate({ path: 'skills', select: 'name' });

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    const { skills, ...restOfDto } = updateCompanyDto;
    return await this.companyModel.updateOne(
      { _id: id },
      {
        ...restOfDto,
        ...(skills && { skills }),
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    await this.companyModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.companyModel.softDelete({
      _id: id
    })
  }

  async findAllPublic(currentPage: number, limit: number, qs: string) {
    const { filter, sort } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;

    let finalFilter: any = { ...filter, isDeleted: false };

    const searchFields = ['name', 'address', 'country', 'industry'];
    for (const field of searchFields) {
      if (finalFilter[field] && typeof finalFilter[field] === 'string') {
        finalFilter[field] = {
          $regex: finalFilter[field],
          $options: 'i'
        };
      }
    }

    const results = await this.companyModel.aggregate([
      { $match: finalFilter },
      {
        $lookup: {
          from: 'jobs',
          let: { companyId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$company._id', '$$companyId'] },
                    { $eq: ['$isActive', true] },
                    { $ne: ['$isDeleted', true] }
                  ]
                }
              }
            }
          ],
          as: 'jobData'
        }
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'skills',
          foreignField: '_id',
          as: 'skillData'
        }
      },
      {
        $addFields: {
          jobCount: { $size: '$jobData' },
          skills: {
            $map: {
              input: "$skillData",
              as: "skill",
              in: { _id: "$$skill._id", name: "$$skill.name" }
            }
          }
        }
      },
      {
        $project: {
          jobData: 0,
          skillData: 0,
          description: 0
        }
      },
      {
        $facet: {
          paginatedResults: [
            { $sort: sort as any || { createdAt: -1 } },
            { $skip: offset },
            { $limit: defaultLimit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const paginatedData = results[0].paginatedResults;
    const totalItems = results[0].totalCount[0]?.count || 0;

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: Math.ceil(totalItems / defaultLimit),
        total: totalItems
      },
      result: paginatedData
    };
  }
}
