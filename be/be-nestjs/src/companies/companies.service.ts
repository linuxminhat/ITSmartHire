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

  //logic pagination query ! 
  async findAll(currentPage: number, limit: number, qs: string, user: IUser) {
    const { filter, skip, sort, projection, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    // --- Role-based Filter --- 
    let finalFilter = { ...filter }; // Start with query string filters
    if (user?.role?.name === 'HR') {
        // If user is HR, add filter to only show companies created by them
        finalFilter['createdBy._id'] = user._id;
    }
    // Admins (or other roles) will use the original filter without the createdBy condition
    // --- End Role-based Filter ---

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
      result //kết quả query
    }

  }
  async findOne(id: string) {
    const company = await this.companyModel.findById(id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Không tìm thấy công ty với id = ${id} hoặc định dạng ID không hợp lệ`);
      // Hoặc trả về thông báo: return "Không tìm thấy công ty";
    }
    // Kiểm tra nếu không thấy
    if (!company) {
      throw new NotFoundException(`Company with id = ${id} not found`);
    }

    // Populate skills when finding one company
    await company.populate({ path: 'skills', select: 'name' });

    return company;
  }
  // async findOne(id: string) {
  //   return `This action returns a #${id} company`;
  // }

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
}
