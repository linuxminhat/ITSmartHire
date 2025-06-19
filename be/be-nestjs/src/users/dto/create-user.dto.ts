import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested, IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';
import mongoose from 'mongoose';

class CompanyDto {
    @IsNotEmpty()
    @IsMongoId({ message: "Company ID phải là MongoID hợp lệ" })
    _id: mongoose.Schema.Types.ObjectId;

}

export class CreateUserDto {
    @IsNotEmpty({ message: 'Tên không được bỏ trống' })
    @IsString({ message: 'Tên phải là chuỗi' })
    name: string;

    @IsEmail({}, { message: 'Email không đúng định dạng ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    @IsString({ message: 'Mật khẩu phải là chuỗi' })
    password: string;

    @IsNotEmpty({ message: 'Tuổi không được bỏ trống' })
    @IsNumber({}, { message: 'Tuổi phải là số' })
    @Type(() => Number)
    age: number;

    @IsNotEmpty({ message: ' Giới tính không được bỏ trống ' })
    @IsString({ message: 'Giới tính phải là chuỗi' })
    gender: string;

    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống ' })
    @IsString({ message: 'Địa chỉ phải là chuỗi' })
    address: string;

    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    @IsMongoId({ message: "Role ID phải là MongoID hợp lệ" })
    role: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @IsMongoId({ message: "Company ID phải là MongoID hợp lệ" })
    company?: string;
}

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Tên không được bỏ trống', })
    name: string;
    @IsEmail({}, { message: 'Email không đúng định dạng ', })
    @IsNotEmpty({ message: 'Email không đúng định dạng', })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;
    @IsNotEmpty({ message: 'Tuổi không được bỏ trống' })
    @IsNumber({}, { message: 'Tuổi phải là số' })
    @Type(() => Number)
    age: number;
    @IsNotEmpty({ message: ' Giới tính không được bỏ trống ' })
    gender: string;
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống ' })
    address: string;

    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    @IsMongoId({ message: "Role ID phải là MongoID hợp lệ" })
    role: mongoose.Schema.Types.ObjectId;
}

export class UpdateUserProfileDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Tên không được bỏ trống' })
    @IsString({ message: 'Tên phải là chuỗi' })
    name?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Tuổi không được bỏ trống' })
    @IsNumber({}, { message: 'Tuổi phải là số' })
    @Type(() => Number)
    age?: number;

    @IsOptional()
    @IsNotEmpty({ message: ' Giới tính không được bỏ trống ' })
    @IsString({ message: 'Giới tính phải là chuỗi' })
    gender?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống ' })
    @IsString({ message: 'Địa chỉ phải là chuỗi' })
    address?: string;

    @IsOptional()
    @IsString({ message: 'Số điện thoại phải là chuỗi' })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'Giới thiệu bản thân phải là chuỗi' })
    aboutMe?: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL CV không hợp lệ' })
    cvUrl?: string;

}

export class RegisterEmployee {

}