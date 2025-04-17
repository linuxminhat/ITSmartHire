import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';
export class CreateRoleDto {
    @IsNotEmpty({ message: 'Tên không được để trống', })
    name: string;
    @IsNotEmpty({ message: 'Phần mô tả không được để trống', })
    description: string;
    @IsNotEmpty({ message: 'isActive không được để trống', })
    @IsBoolean({ message: 'isActive có giá trị boolean', })
    isActive: boolean;
    @IsNotEmpty({ message: 'permissions không được để trống', })
    @IsMongoId({ each: true, message: "Mỗi PERMISSION là mongo object id", })
    @IsArray({ message: 'Mỗi PERMISSION có định dạng là mảng', })
    permissions: mongoose.Schema.Types.ObjectId[];

}