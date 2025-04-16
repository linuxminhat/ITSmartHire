import { IsNotEmpty, IsNumber, IsNumberString, IsOptional } from 'class-validator';
export class CreateCompanyDto {
    @IsNotEmpty({ message: "Tên công ty không được để trống", })
    name: string;

    @IsNotEmpty({ message: "Địa chỉ công ty không được để trống", })
    address: string;

    @IsNotEmpty({ message: "Mô tả công ty không được để trống", })
    description: string;

    @IsNotEmpty({ message: 'Logo không được để trống' })
    logo: string;

    @IsNotEmpty({ message: 'Vĩ độ (latitude) không được để trống' })
    @IsNumberString({}, { message: 'Vĩ độ phải là số' })
    latitude: number;

    @IsNotEmpty({ message: 'Kinh độ (longitude) không được để trống' })
    @IsNumberString({}, { message: 'Kinh độ phải là số' })
    longitude: number;


}