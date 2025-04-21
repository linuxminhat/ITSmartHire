import { IsMongoId, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import mongoose from 'mongoose';

export class CreateApplicationDto {
  @IsNotEmpty({ message: 'jobId không được để trống' })
  @IsMongoId({ message: 'jobId phải là một mongo id hợp lệ' })
  jobId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'cvUrl không được để trống' })
  @IsString({ message: 'cvUrl phải là dạng chuỗi' })
  @IsUrl({}, { message: 'cvUrl phải là một URL hợp lệ' })
  cvUrl: string;
} 