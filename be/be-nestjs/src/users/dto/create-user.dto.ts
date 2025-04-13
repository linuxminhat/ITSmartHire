import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;
    @IsNotEmpty()
    name: string;
}

export class CreateUserDto {
    @IsNotEmpty({ message: 'Tên không được bỏ trống' })
    name: string;
    @IsEmail({}, { message: 'Email không đúng định dạng ', })
    @IsNotEmpty({ message: 'Email không đúng định dạng', })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;
    @IsNotEmpty({ message: 'Tuổi không được bỏ trống' })
    age: number;
    @IsNotEmpty({ message: ' Giới tính không được bỏ trống ' })
    gender: string;
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống ' })
    address: string;
    @IsNotEmpty({ message: 'Vai trò không được bỏ trống' })
    role: string;

    //This is use for validate an object 
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

}
export class RegisterUserDto {
    @IsNotEmpty({ message: 'Tên không được bỏ trống', })
    name: string;
    @IsEmail({}, { message: 'Email không đúng định dạng ', })
    @IsNotEmpty({ message: 'Email không đúng định dạng', })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được bỏ trống' })
    password: string;
    @IsNotEmpty({ message: 'Tuổi không được bỏ trống' })
    age: number;
    @IsNotEmpty({ message: ' Giới tính không được bỏ trống ' })
    gender: string;
    @IsNotEmpty({ message: 'Địa chỉ không được bỏ trống ' })
    address: string;
}
export class RegisterEmployee {

}