import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for adding a new experience entry
export class AddExperienceDto {
    @IsNotEmpty({ message: 'Tên công ty không được bỏ trống' })
    @IsString()
    companyName: string;

    @IsNotEmpty({ message: 'Chức danh không được bỏ trống' })
    @IsString()
    jobTitle: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsNotEmpty({ message: 'Ngày bắt đầu không được bỏ trống' })
    @Type(() => Date) // Transform string/number to Date
    @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
    startDate: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
    endDate?: Date;

    @IsOptional()
    @IsString()
    description?: string;

    // Optional skillsUsed field validation if added to schema later
    // @IsOptional()
    // @IsArray()
    // @IsString({ each: true })
    // skillsUsed?: string[];
}

// DTO for updating an existing experience entry
export class UpdateExperienceDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Tên công ty không được bỏ trống khi cập nhật' })
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Chức danh không được bỏ trống khi cập nhật' })
    @IsString()
    jobTitle?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
    endDate?: Date;

    @IsOptional()
    @IsString()
    description?: string;

    // Optional skillsUsed field validation if added to schema later
    // @IsOptional()
    // @IsArray()
    // @IsString({ each: true })
    // skillsUsed?: string[];
} 