import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, RegisterUserDto, UpdateUserProfileDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddEducationDto, UpdateEducationDto } from './dto/education.dto';
import { AddExperienceDto, UpdateExperienceDto } from './dto/experience.dto';
import { UpdateSkillsDto } from './dto/skills.dto';
import { AddProjectDto, UpdateProjectDto } from './dto/project.dto';
import { AddCertificateDto, UpdateCertificateDto } from './dto/certificate.dto';
import { AddAwardDto, UpdateAwardDto } from './dto/award.dto';
import { AddAttachedCvDto } from './dto/add-attached-cv.dto';
import { AttachedCv } from './schemas/user.shema';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from './users.interface';
import { ListUsersDto } from './dto/list-users.dto';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    //Chức năng tìm kiếm 

    @Post()
    @ResponseMessage('Create a new user')
    async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
        let newUser = await this.usersService.create(createUserDto, user);
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt
        }
    }
    // @Get()
    // @ResponseMessage("Fetch user with paginate")
    // findAll(
    //     @Query("current") currentPage: string,
    //     @Query("pageSize") limit: string,
    //     @Query() qs: string,
    //     @Query() query: ListUsersDto) {
    //     return this.usersService.findAll(+currentPage, +limit, qs, query);
    // }
    @Get()
    @ResponseMessage('Fetch user with paginate')
    findAll(@Query() query: ListUsersDto) {
        return this.usersService.findAll(query);   // gọi service
    }

    @Get('profile')
    @ResponseMessage("Fetch user profile success")
    async getUserProfile(@User() user: IUser) {
        return await this.usersService.findUserProfile(user._id);
    }

    @Public()
    @Get(':id')
    @ResponseMessage("Fetch a user by id")
    async findOne(@Param("id") id: string) {
        const foundUser = await this.usersService.findOneById(id);
        return foundUser;
    }

    @Patch('profile')
    @ResponseMessage("Update user profile success")
    async updateUserProfile(@User() user: IUser, @Body() updateUserProfileDto: UpdateUserProfileDto) {
        return await this.usersService.updateUserProfile(user._id, updateUserProfileDto);
    }

    @Post('profile/education')
    @ResponseMessage("Add education entry")
    async addEducation(
        @User() user: IUser,
        @Body() addEducationDto: AddEducationDto
    ) {
        return this.usersService.addEducation(user._id, addEducationDto);
    }

    @Patch('profile/education/:eduId')
    @ResponseMessage("Update education entry")
    async updateEducation(
        @User() user: IUser,
        @Param('eduId') eduId: string,
        @Body() updateEducationDto: UpdateEducationDto
    ) {
        return this.usersService.updateEducation(user._id, eduId, updateEducationDto);
    }

    @Delete('profile/education/:eduId')
    @ResponseMessage("Delete education entry")
    async deleteEducation(
        @User() user: IUser,
        @Param('eduId') eduId: string
    ) {
        return this.usersService.deleteEducation(user._id, eduId);
    }

    @Post('profile/experience')
    @ResponseMessage("Add experience entry")
    async addExperience(
        @User() user: IUser,
        @Body() addExperienceDto: AddExperienceDto
    ) {
        return this.usersService.addExperience(user._id, addExperienceDto);
    }

    @Patch('profile/experience/:expId')
    @ResponseMessage("Update experience entry")
    async updateExperience(
        @User() user: IUser,
        @Param('expId') expId: string,
        @Body() updateExperienceDto: UpdateExperienceDto
    ) {
        return this.usersService.updateExperience(user._id, expId, updateExperienceDto);
    }

    @Delete('profile/experience/:expId')
    @ResponseMessage("Delete experience entry")
    async deleteExperience(
        @User() user: IUser,
        @Param('expId') expId: string
    ) {
        return this.usersService.deleteExperience(user._id, expId);
    }

    @Patch('profile/skills')
    @ResponseMessage("Update user skills")
    async updateSkills(
        @User() user: IUser,
        @Body() updateSkillsDto: UpdateSkillsDto
    ) {
        return this.usersService.updateSkills(user._id, updateSkillsDto);
    }

    @Post('profile/project')
    @ResponseMessage("Add project entry")
    async addProject(
        @User() user: IUser,
        @Body() addProjectDto: AddProjectDto
    ) {
        return this.usersService.addProject(user._id, addProjectDto);
    }

    @Patch('profile/project/:projectId')
    @ResponseMessage("Update project entry")
    async updateProject(
        @User() user: IUser,
        @Param('projectId') projectId: string,
        @Body() updateProjectDto: UpdateProjectDto
    ) {
        return this.usersService.updateProject(user._id, projectId, updateProjectDto);
    }

    @Delete('profile/project/:projectId')
    @ResponseMessage("Delete project entry")
    async deleteProject(
        @User() user: IUser,
        @Param('projectId') projectId: string
    ) {
        return this.usersService.deleteProject(user._id, projectId);
    }

    @Post('profile/certificate')
    @ResponseMessage("Add certificate entry")
    async addCertificate(
        @User() user: IUser,
        @Body() addCertificateDto: AddCertificateDto
    ) {
        return this.usersService.addCertificate(user._id, addCertificateDto);
    }

    @Patch('profile/certificate/:certId')
    @ResponseMessage("Update certificate entry")
    async updateCertificate(
        @User() user: IUser,
        @Param('certId') certId: string,
        @Body() updateCertificateDto: UpdateCertificateDto
    ) {
        return this.usersService.updateCertificate(user._id, certId, updateCertificateDto);
    }

    @Delete('profile/certificate/:certId')
    @ResponseMessage("Delete certificate entry")
    async deleteCertificate(
        @User() user: IUser,
        @Param('certId') certId: string
    ) {
        return this.usersService.deleteCertificate(user._id, certId);
    }

    @Post('profile/award')
    @ResponseMessage("Add award entry")
    async addAward(
        @User() user: IUser,
        @Body() addAwardDto: AddAwardDto
    ) {
        return this.usersService.addAward(user._id, addAwardDto);
    }

    @Patch('profile/award/:awardId')
    @ResponseMessage("Update award entry")
    async updateAward(
        @User() user: IUser,
        @Param('awardId') awardId: string,
        @Body() updateAwardDto: UpdateAwardDto
    ) {
        return this.usersService.updateAward(user._id, awardId, updateAwardDto);
    }

    @Delete('profile/award/:awardId')
    @ResponseMessage("Delete award entry")
    async deleteAward(
        @User() user: IUser,
        @Param('awardId') awardId: string
    ) {
        return this.usersService.deleteAward(user._id, awardId);
    }

    @ResponseMessage("Update a user (Admin)")
    @Patch(':id')
    async updateUserGeneral(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @User() user: IUser
    ) {
        let updatedUser = await this.usersService.update(id, updateUserDto, user);
        return updatedUser;
    }

    @Delete(':id')
    @ResponseMessage("Delete a user (Admin)")
    remove(@Param('id') id: string, @User() user: IUser) {
        return this.usersService.remove(id, user);
    }

    @Get('me/attached-cvs')
    @ResponseMessage("Fetch user attached CVs success")
    async getUserAttachedCvs(@User() user: IUser): Promise<AttachedCv[]> {
        return await this.usersService.getAttachedCvs(user._id);
    }

    @Post('me/attached-cvs')
    @ResponseMessage("Add new attached CV success")
    async addAttachedCv(@User() user: IUser, @Body() addCvDto: AddAttachedCvDto) {
        return await this.usersService.addAttachedCv(user._id, addCvDto);
    }

    @Delete('me/attached-cvs/:cvId')
    @ResponseMessage("Delete attached CV success")
    async deleteAttachedCv(@User() user: IUser, @Param('cvId') cvId: string) {
        return await this.usersService.deleteAttachedCv(user._id, cvId);
    }
}