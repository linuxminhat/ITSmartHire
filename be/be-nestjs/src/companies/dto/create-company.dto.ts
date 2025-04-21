import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

export class CreateCompanyDto {
    @IsNotEmpty({ message: "Tên công ty không được để trống", })
    @IsString({ message: "Tên công ty phải là chuỗi"})
    name: string;

    @IsNotEmpty({ message: "Địa chỉ công ty không được để trống", })
    @IsString({ message: "Địa chỉ công ty phải là chuỗi"})
    address: string;

    @IsNotEmpty({ message: "Mô tả công ty không được để trống", })
    @IsString({ message: "Mô tả công ty phải là chuỗi"})
    description: string;

    @IsNotEmpty({ message: 'Logo không được để trống' })
    @IsString({ message: 'Logo phải là chuỗi'})
    logo: string;

    @IsNotEmpty({ message: 'Vĩ độ (latitude) không được để trống' })
    @IsNumber({}, { message: 'Vĩ độ phải là số' })
    @Type(() => Number)
    latitude: number;

    @IsNotEmpty({ message: 'Kinh độ (longitude) không được để trống' })
    @IsNumber({}, { message: 'Kinh độ phải là số' })
    @Type(() => Number)
    longitude: number;

    @IsOptional()
    @IsArray({ message: 'skills định dạng là array' })
    @IsMongoId({ each: true, message: 'skill là mongo id' })
    skills: mongoose.Schema.Types.ObjectId[];

    @IsOptional()
    @IsString()
    specializationDescription?: string;

    @IsOptional()
    @IsString()
    companyModel?: string;

    @IsOptional()
    @IsString()
    industry?: string;

    @IsOptional()
    @IsString()
    companySize?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    workingTime?: string;
}