import { IsNotEmpty } from "class-validator";
export class CreatePermissionDto {
    @IsNotEmpty({ message: 'Tên không được để trống', })
    name: string;
    @IsNotEmpty({ message: 'apiPath không được để trống', })
    apiPath: string;
    @IsNotEmpty({ message: 'Hàm method không được để trống', })
    method: string;
    @IsNotEmpty({ message: 'Module Không được để trống', })
    module: string;
}