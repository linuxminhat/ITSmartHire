import { IsString, IsNotEmpty, IsOptional, IsDate, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCertificateDto {
    @IsNotEmpty({ message: 'Tên chứng chỉ không được bỏ trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Tổ chức cấp không được bỏ trống' })
    @IsString()
    issuingOrganization: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày cấp không hợp lệ' })
    issueDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày hết hạn không hợp lệ' })
    expirationDate?: Date;

    @IsOptional()
    @IsString()
    credentialId?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link chứng chỉ không hợp lệ' })
    credentialUrl?: string;
}

export class UpdateCertificateDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Tên chứng chỉ không được bỏ trống khi cập nhật' })
    @IsString()
    name?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Tổ chức cấp không được bỏ trống khi cập nhật' })
    @IsString()
    issuingOrganization?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày cấp không hợp lệ' })
    issueDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate({ message: 'Ngày hết hạn không hợp lệ' })
    expirationDate?: Date;

    @IsOptional()
    @IsString()
    credentialId?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link chứng chỉ không hợp lệ' })
    credentialUrl?: string;
} 