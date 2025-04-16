import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
// import { Company } from 'src/companies/schemas/company.schema';
class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    logo: string;
}
export class CreateJobDto {
    @IsNotEmpty({ message: "Tên công việc không được để trống", })
    name: string;

    @IsArray({ message: "Tên kĩ năng liệt kê định dạng là mảng" })
    @ArrayNotEmpty({ message: "Tên kĩ năng không được để trống" })
    //Each meaning check item in array 
    @IsString({ each: true, message: "Kĩ năng có định dạng là string" })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    // company: {
    //     _id: mongoose.Schema.Types.ObjectId;
    //     name: string;
    // }
    company: Company;


    @IsNotEmpty({ message: "Địa chỉ không được để trống" })
    location: string;
    @IsNotEmpty({ message: "Tên lương không được để trống", })
    salary: number;

    @IsNotEmpty({ message: "Tên số lượng người tuyển không được để trống", })
    quantity: number;

    @IsNotEmpty({ message: "Vị trí công việc không được để trống", })
    level: string;

    @IsNotEmpty({ message: "Mô tả công việc không được để trống" })
    description: string;

    @IsNotEmpty({ message: "Ngày đăng công việc không được để trống", })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: 'startdate có định dạng là date' })
    startDate: Date;

    @IsNotEmpty({ message: "Ngày hết hạn công việc không được để trống", })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: 'startdate có định dạng là date' })
    endDate: Date;

    @IsNotEmpty({ message: "Trạng thái công việc không được để trống", })
    @IsBoolean({ message: 'startdate có định dạng là date' })
    isActive: boolean;

}