import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceDto {
    //firebase token
    //get request from client for signing device
    @IsNotEmpty({ message: 'Token không được để trống' })
    @IsString({ message: 'Token phải là dạng chuỗi' })
    token: string;
}