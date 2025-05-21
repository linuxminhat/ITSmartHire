import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceDto {
    @IsNotEmpty({ message: 'Token không được để trống' })
    @IsString({ message: 'Token phải là dạng chuỗi' })
    token: string;
}