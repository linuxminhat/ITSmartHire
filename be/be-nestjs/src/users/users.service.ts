import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.shema';
import mongoose, { Model } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { USER_ROLE } from 'src/databases/sample';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

@Injectable()
export class UsersService {

  constructor(@InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>, @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }

  hashPassword = (password: string) => {

    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;

  }


  async create(createUserDto: CreateUserDto, user: IUser) {
    const {
      name, email, password, age,
      gender, address, role, company
    } = createUserDto;
    //check logic email 
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadGatewayException(`Email : ${email} đã tồn tại trên hệ thống `)
    }
    const hashPassword = this.hashPassword(createUserDto.password);
    let newUser = await this.userModel.create({
      name, email,
      password: hashPassword,
      age,
      gender, address, role, company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return newUser;

  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "Not found a user !"

    return await this.userModel.findOne({
      _id: id
    })
      .select("-password").populate({ path: "role", select: { name: 1, _id: 1 } });
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({
      path: "role", select: { name: 1, permissions: 1 }
    });
  }


  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    const updated = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      });
    return updated;

  }
  async remove(id: string, user: IUser) {
    //email : adminitsmarthire@gmail.com
    if (!mongoose.Types.ObjectId.isValid(id))
      return 'not found user';

    const foundUser = await this.userModel.findById(id);
    if (foundUser.email === 'adminitsmarthire@gmail.com') {
      throw new BadRequestException("Không thể xóa tài khoản admin của hệ thống ")
    }

    //first update then remove 
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.userModel.softDelete({
      _id: id
    });
  }

  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user; //Pass from DTO 
    //Adding logic checking whether email exist
    const isExist = await this.userModel.findOne({ email: email });
    if (isExist) {
      throw new BadGatewayException(`Email ${email} đã tồn tại `);
    }
    //fetch user role 
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashPassword = this.hashPassword(password);
    let newRegister = await this.userModel.create({
      name, email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole?._id
    })
    return newRegister;

  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .select('-password')
      .populate(population)
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
  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      {
        refreshToken
      }
    )

  }
  findUserbyToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({ path: "role", select: { name: 1 } });
  }

}
