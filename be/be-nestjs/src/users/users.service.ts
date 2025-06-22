import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto, UpdateUserProfileDto } from './dto/create-user.dto';
import { AddEducationDto, UpdateEducationDto } from './dto/education.dto';
import { AddExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument, Education, Experience, Project, Certificate, Award, AttachedCv } from './schemas/user.shema';
import mongoose, { Model, Types } from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { UpdateSkillsDto } from './dto/skills.dto';
import { AddProjectDto, UpdateProjectDto } from './dto/project.dto';
import { AddCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';
import { AddAwardDto, UpdateAwardDto } from './dto/award.dto';
import { AddAttachedCvDto } from './dto/add-attached-cv.dto';
import { ListUsersDto } from './dto/list-users.dto';

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

  async findOneById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return "Not found a user !"

    return await this.userModel.findOne({
      _id: id
    })
      .select("-password -refreshToken")
      .populate({ path: "role", select: { name: 1, _id: 1 } })
      .populate({ path: 'company', select: 'name _id' });
  }

  async findUserProfile(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId))
      return "Not found a user !"

    const selectFields = [
      '_id', 'name', 'email', 'age', 'gender', 'address',
      'phone', 'aboutMe', 'designation', 'skills', 'cvUrl',
      'createdAt', 'updatedAt'
    ].join(' ');

    return await this.userModel.findOne({ _id: userId })
      .select(selectFields)
      .populate({ path: "role", select: { name: 1, _id: 1 } })
      .populate({ path: 'company', select: 'name _id' })
      .populate('education')
      .populate('experience')
      .populate('projects')
      .populate('certificates')
      .populate('awards')
      .exec();
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({
      email: username
    })
      .select("+password")
      .populate({
        path: "role", select: { name: 1 }
      });
  }


  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    const updated = await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
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
    if (foundUser && foundUser.email === 'adminitsmarthire@gmail.com') {
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

  async register(userDto: RegisterUserDto) {
    const { name, email, password, age, gender, address, role } = userDto;

    const isExist = await this.userModel.findOne({ email: email });
    if (isExist) {
      throw new BadGatewayException(`Email ${email} đã tồn tại `);
    }

    const hashPassword = this.hashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: role
    })
    return newRegister;
  }
  //server side pagination 
  async findAll(dto: ListUsersDto) {
    //not value, 1 
    const current = +dto.current || 1;
    //10 item in page 
    const pageSize = +dto.pageSize || 10;
    //filter condition variable 
    const match: any = {};

    if (dto.name) match.name = { $regex: dto.name, $options: 'i' };
    if (dto.email) match.email = { $regex: dto.email, $options: 'i' };
    //aggeration pipeline
    const pipeline: any[] = [
      //dont list user that deleted 
      { $match: { isDeleted: { $ne: true } } },
      { $match: match },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        }
      },
      { $unwind: '$role' },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } },
    ];

    if (dto.role) {
      pipeline.push({
        $match: { 'role.name': { $regex: dto.role, $options: 'i' } },
      });
    }
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const [{ total = 0 } = {}] = await this.userModel.aggregate(totalPipeline);

    //page pagination 
    //skip : this page will start which page ? 
    //limit : limit of object pagesize return 
    pipeline.push({ $skip: (current - 1) * pageSize });
    pipeline.push({ $limit: pageSize });
    const result = await this.userModel.aggregate(pipeline);
    return {
      result,
      meta: {
        current,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    };
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
    return await this.userModel.findOne({ refreshToken })
      .populate({ path: "role", select: { name: 1 } });
  }

  async updateUserProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }
    //create temporary data type
    type UserProfileUpdateData = Partial<Pick<UserM, 'name' | 'age' | 'gender' | 'address' | 'phone' | 'aboutMe' | 'designation'>> & { updatedBy?: object };

    const updateData: UserProfileUpdateData = {};
    if (updateUserProfileDto.name !== undefined) updateData.name = updateUserProfileDto.name;
    if (updateUserProfileDto.age !== undefined) updateData.age = updateUserProfileDto.age;
    if (updateUserProfileDto.gender !== undefined) updateData.gender = updateUserProfileDto.gender;
    if (updateUserProfileDto.address !== undefined) updateData.address = updateUserProfileDto.address;
    if (updateUserProfileDto.phone !== undefined) updateData.phone = updateUserProfileDto.phone;
    if (updateUserProfileDto.aboutMe !== undefined) updateData.aboutMe = updateUserProfileDto.aboutMe;
    if (updateUserProfileDto.designation !== undefined) updateData.designation = updateUserProfileDto.designation;

    //case : person not update data 
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('Không có thông tin nào được cung cấp để cập nhật.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },//update every field in updateData
      { new: true }
    )
      .populate({ path: "role", select: { name: 1, _id: 1 } })
      .populate('education')
      .populate('experience')
      .populate('projects')
      .populate('certificates')
      .populate('awards')
      .populate('attachedCvs')
      .select("-password -refreshToken")
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async addEducation(userId: string, addEducationDto: AddEducationDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const newEducationEntry = {
      ...addEducationDto,
    };

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { education: newEducationEntry } },
      { new: true } //Ask Mongoose to return the document after update
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async updateEducation(userId: string, eduId: string, updateEducationDto: UpdateEducationDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eduId)) {
      throw new BadRequestException('ID người dùng hoặc ID học vấn không hợp lệ');
    }

    const updateFields = {};
    //Browse all submitted fields
    for (const key in updateEducationDto) {
      if (updateEducationDto.hasOwnProperty(key)) {
        updateFields[`education.$.${key}`] = updateEducationDto[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('Không có thông tin nào được cung cấp để cập nhật học vấn.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId, 'education._id': eduId },
      { $set: updateFields },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy mục học vấn với ID ${eduId} cho người dùng ID ${userId}`);
    }
    return updatedUser;
  }

  async deleteEducation(userId: string, eduId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eduId)) {
      throw new BadRequestException('ID người dùng hoặc ID học vấn không hợp lệ');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      //Removes an element from an array, if it matches a condition.
      { $pull: { education: { _id: eduId } } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return updatedUser;
  }

  async addExperience(userId: string, addExperienceDto: AddExperienceDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const newExperienceEntry = {
      ...addExperienceDto,
    };

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { experience: newExperienceEntry } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async updateExperience(userId: string, expId: string, updateExperienceDto: UpdateExperienceDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(expId)) {
      throw new BadRequestException('ID người dùng hoặc ID kinh nghiệm không hợp lệ');
    }

    const updateFields = {};
    for (const key in updateExperienceDto) {
      if (updateExperienceDto.hasOwnProperty(key)) {
        updateFields[`experience.$.${key}`] = updateExperienceDto[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('Không có thông tin nào được cung cấp để cập nhật kinh nghiệm.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId, 'experience._id': expId },
      { $set: updateFields },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy mục kinh nghiệm với ID ${expId} cho người dùng ID ${userId}`);
    }
    return updatedUser;
  }

  async deleteExperience(userId: string, expId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(expId)) {
      throw new BadRequestException('ID người dùng hoặc ID kinh nghiệm không hợp lệ');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { experience: { _id: expId } } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return updatedUser;
  }

  async updateSkills(userId: string, updateSkillsDto: UpdateSkillsDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    if (updateSkillsDto.skills === undefined) {
      throw new BadRequestException('Trường kỹ năng là bắt buộc để cập nhật.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { skills: updateSkillsDto.skills } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async addProject(userId: string, addProjectDto: AddProjectDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const newProjectEntry: Omit<Project, '_id' | 'createdAt' | 'updatedAt'> = {
      ...addProjectDto,
    };

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { projects: newProjectEntry } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async updateProject(userId: string, projectId: string, updateProjectDto: UpdateProjectDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('ID người dùng hoặc ID dự án không hợp lệ');
    }

    const updateFields = {};
    for (const key in updateProjectDto) {
      if (updateProjectDto.hasOwnProperty(key)) {
        updateFields[`projects.$.${key}`] = updateProjectDto[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('Không có thông tin nào được cung cấp để cập nhật dự án.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId, 'projects._id': projectId },
      { $set: updateFields },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy dự án với ID ${projectId} cho người dùng ID ${userId}`);
    }
    return updatedUser;
  }

  async deleteProject(userId: string, projectId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('ID người dùng hoặc ID dự án không hợp lệ');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { projects: { _id: projectId } } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return updatedUser;
  }

  async addCertificate(userId: string, addCertificateDto: AddCertificateDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    //Omit<Type, Keys> is TypeScript syntax for ignoring some fields in a type data.
    const newCertificateEntry: Omit<Certificate, '_id' | 'createdAt' | 'updatedAt'> = {
      name: addCertificateDto.name,
      issuingOrganization: addCertificateDto.issuingOrganization,
      ...(addCertificateDto.issueDate && { issueDate: addCertificateDto.issueDate }),
      ...(addCertificateDto.expirationDate && { expirationDate: addCertificateDto.expirationDate }),
      ...(addCertificateDto.credentialId && { credentialId: addCertificateDto.credentialId }),
      ...(addCertificateDto.credentialUrl && { credentialUrl: addCertificateDto.credentialUrl }),
    };

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { certificates: newCertificateEntry } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async updateCertificate(userId: string, certId: string, updateCertificateDto: UpdateCertificateDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(certId)) {
      throw new BadRequestException('ID người dùng hoặc ID chứng chỉ không hợp lệ');
    }

    const updateFields = {};
    for (const key in updateCertificateDto) {
      if (updateCertificateDto.hasOwnProperty(key)) {
        updateFields[`certificates.$.${key}`] = updateCertificateDto[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('Không có thông tin nào được cung cấp để cập nhật chứng chỉ.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId, 'certificates._id': certId },
      { $set: updateFields },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy chứng chỉ với ID ${certId} cho người dùng ID ${userId}`);
    }
    return updatedUser;
  }

  async deleteCertificate(userId: string, certId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(certId)) {
      throw new BadRequestException('ID người dùng hoặc ID chứng chỉ không hợp lệ');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { certificates: { _id: certId } } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return updatedUser;
  }

  async addAward(userId: string, addAwardDto: AddAwardDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const newAwardEntry: Omit<Award, '_id' | 'createdAt' | 'updatedAt'> = {
      title: addAwardDto.title,
      ...(addAwardDto.issuer && { issuer: addAwardDto.issuer }),
      ...(addAwardDto.issueDate && { issueDate: addAwardDto.issueDate }),
      ...(addAwardDto.description && { description: addAwardDto.description }),
    };

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { awards: newAwardEntry } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async updateAward(userId: string, awardId: string, updateAwardDto: UpdateAwardDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(awardId)) {
      throw new BadRequestException('ID người dùng hoặc ID giải thưởng không hợp lệ');
    }

    const updateFields = {};
    for (const key in updateAwardDto) {
      if (updateAwardDto.hasOwnProperty(key)) {
        updateFields[`awards.$.${key}`] = updateAwardDto[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('Không có thông tin nào được cung cấp để cập nhật giải thưởng.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId, 'awards._id': awardId },
      { $set: updateFields },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy giải thưởng với ID ${awardId} cho người dùng ID ${userId}`);
    }
    return updatedUser;
  }

  async deleteAward(userId: string, awardId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(awardId)) {
      throw new BadRequestException('ID người dùng hoặc ID giải thưởng không hợp lệ');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { awards: { _id: awardId } } },
      { new: true }
    ).populate('education').populate('experience').populate('projects').populate('certificates').populate('awards').exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return updatedUser;
  }

  async addAttachedCv(userId: string, addCvDto: AddAttachedCvDto): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const newCvEntry = {
      name: addCvDto.name,
      url: addCvDto.url,
    };

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { attachedCvs: newCvEntry } },
      { new: true }
    )
      .select('-password -refreshToken')
      .populate('attachedCvs')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return updatedUser;
  }

  async getAttachedCvs(userId: string): Promise<AttachedCv[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const user = await this.userModel.findById(userId).select('attachedCvs').exec();

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
    return user.attachedCvs || [];
  }

  async deleteAttachedCv(userId: string, cvId: string): Promise<UserDocument> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(cvId)) {
      throw new BadRequestException('ID người dùng hoặc ID CV không hợp lệ');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { attachedCvs: { _id: new Types.ObjectId(cvId) } } },
      { new: true }
    )
      .select('-password -refreshToken')
      .populate('attachedCvs')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return updatedUser;
  }
}
