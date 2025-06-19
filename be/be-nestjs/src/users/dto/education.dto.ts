import { IsString, IsNotEmpty, IsOptional, IsDate, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class AddEducationDto {
    @IsNotEmpty({ message: 'Tên trường không được bỏ trống' })
    @IsString()
    school: string;

    @IsNotEmpty({ message: 'Bằng cấp không được bỏ trống' })
    @IsString()
    degree: string;

    @IsOptional()
    @IsString()
    fieldOfStudy?: string;

    @IsNotEmpty({ message: 'Ngày bắt đầu không được bỏ trống' })
    @Type(() => Date)
    @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
    startDate: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
    endDate?: Date;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateEducationDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Tên trường không được bỏ trống khi cập nhật' })
    @IsString()
    school?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Bằng cấp không được bỏ trống khi cập nhật' })
    @IsString()
    degree?: string;

    @IsOptional()
    @IsString()
    fieldOfStudy?: string;

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
} 