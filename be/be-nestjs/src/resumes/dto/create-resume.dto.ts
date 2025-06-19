import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
    @IsNotEmpty({ message: 'Email không được để trống', })
    email: string;
    @IsNotEmpty({ message: 'userId không được để trống', })
    userId: mongoose.Schema.Types.ObjectId;
    @IsNotEmpty({ message: 'url không được để trống', })
    url: string;
    //PENDING - APPROVED - REJECTED
    @IsNotEmpty({ message: 'Tình trạng không được để trống', })
    status: string;
    @IsNotEmpty({ message: 'Mã ID của công ty không được để trống', })
    companyId: string;
    @IsNotEmpty({ message: 'Mã ID của công việc  không được để trống', })
    jobId: mongoose.Schema.Types.ObjectId;
}
export class CreateUserCvDto {
    @IsNotEmpty({ message: 'url không được để trống', })
    url: string;
    @IsNotEmpty({ message: 'Mã ID của công ty không được để trống', })
    @IsMongoId({ message: 'Mã ID của công ty sẽ thuộc mongo ID ', })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Mã ID của công việc không được để trống', })
    @IsMongoId({ message: 'Mã ID của công việc sẽ thuộc mongo ID ', })
    jobId: mongoose.Schema.Types.ObjectId;

}