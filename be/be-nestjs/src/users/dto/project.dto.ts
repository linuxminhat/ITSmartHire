import { IsString, IsNotEmpty, IsOptional, IsDate, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// DTO for adding a new project entry
export class AddProjectDto {
    @IsNotEmpty({ message: 'Tên dự án không được bỏ trống' })
    @IsString()
    name: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL dự án không hợp lệ' })
    url?: string;

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

    @IsOptional()
    @IsArray({ message: 'Công nghệ phải là một mảng' })
    @IsString({ each: true, message: 'Mỗi công nghệ phải là một chuỗi' })
    technologiesUsed?: string[];
}

// DTO for updating an existing project entry
export class UpdateProjectDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Tên dự án không được bỏ trống khi cập nhật' })
    @IsString()
    name?: string;

    @IsOptional()
    @IsUrl({}, { message: 'URL dự án không hợp lệ' })
    url?: string;

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

    @IsOptional()
    @IsArray({ message: 'Công nghệ phải là một mảng' })
    @IsString({ each: true, message: 'Mỗi công nghệ phải là một chuỗi' })
    technologiesUsed?: string[];
}
 