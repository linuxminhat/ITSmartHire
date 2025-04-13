import { IsNotEmpty, IsNumber, Matches } from 'class-validator';
import mongoose from 'mongoose';
export class CreateJobDto {
    @IsNotEmpty({ message: "Tên công việc không được để trống", })
    name: string;

    @IsNotEmpty({ message: "Tên kĩ năng không được để trống", })
    skills: string[];

    @IsNotEmpty({ message: "Tên công ty tuyển dụng không được để trống", })
    company: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
    }

    @IsNotEmpty({ message: "Tên kĩ năng không được để trống", })
    location: string;

    @IsNotEmpty({ message: "Tên lương không được để trống", })
    @IsNumber({}, { message: "Lương phải là số, đơn vị VNĐ và chấp nhận các đồng tiền ngoại tệ" })
    salary: string;

    @IsNotEmpty({ message: "Tên số lượng người tuyển không được để trống", })
    @IsNumber({}, { message: "Không giới hạn người tuyển dụng từ 1 người cho vị trí đăng tuyển" })
    quantity: string;

    @IsNotEmpty({ message: "Vị trí công việc không được để trống", })
    level: string;

    @IsNotEmpty({ message: "Mô tả công việc không được để trống" })
    description: string;

    @IsNotEmpty({ message: "Ngày đăng công việc không được để trống", })
    startDate: string;

    @IsNotEmpty({ message: "Ngày hết hạn công việc không được để trống", })
    endDate: string;

    @IsNotEmpty({ message: "Trạng thái công việc không được để trống", })
    isActive: boolean;

}