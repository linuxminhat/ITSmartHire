import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested, IsOptional, IsString, IsNumber, IsUrl } from 'class-validator';
import mongoose from 'mongoose';

// DTO phụ cho Company ID (nên tách ra file riêng nếu dùng nhiều nơi)
class CompanyDto { 
    @IsNotEmpty()
    @IsMongoId({ message: "Company ID phải là MongoID hợp lệ"})
    _id: mongoose.Schema.Types.ObjectId;

    // Bạn có thể bỏ name nếu chỉ cần gửi ID
    // @IsNotEmpty()
    // @IsString()
    // name: string; 
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
    @Type(() => Number) // Thêm Type cho number validation
    age: number;
    
    @IsNotEmpty({ message: ' Giới tính không được bỏ trống ' })
    @IsString({ message: 'Giới tính phải là chuỗi' })
    gender: string; // Nên dùng Enum nếu có thể: 'MALE' | 'FEMALE' | 'OTHER'
    
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống ' })
    @IsString({ message: 'Địa chỉ phải là chuỗi' })
    address: string;
    
    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    @IsMongoId({ message: "Role ID phải là MongoID hợp lệ" })
    role: mongoose.Schema.Types.ObjectId;

    // Sửa validation cho company để chấp nhận string ID
    @IsOptional() // Giữ lại nếu company là tùy chọn
    @IsMongoId({ message: "Company ID phải là MongoID hợp lệ"})
    company?: string; // Thay đổi kiểu thành string và là optional
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

    // Add role field similar to CreateUserDto
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
    phone?: string; // Add optional phone field

    @IsOptional()
    @IsString({ message: 'Giới thiệu bản thân phải là chuỗi' })
    aboutMe?: string; // Add optional aboutMe field

    // Add optional cvUrl field
    @IsOptional()
    @IsUrl({}, { message: 'URL CV không hợp lệ' })
    cvUrl?: string;

    // Add other updatable basic profile fields here later if needed
    // e.g., birthday, jobTitle, personalLink
}

export class RegisterEmployee {

}