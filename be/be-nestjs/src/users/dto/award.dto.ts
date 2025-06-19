import { IsString, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class AddAwardDto {
    @IsNotEmpty({ message: 'Tên giải thưởng không được bỏ trống' })
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    issuer?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày nhận giải không hợp lệ' })
    issueDate?: Date;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateAwardDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Tên giải thưởng không được bỏ trống khi cập nhật' })
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    issuer?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày nhận giải không hợp lệ' })
    issueDate?: Date;

    @IsOptional()
    @IsString()
    description?: string;
} 