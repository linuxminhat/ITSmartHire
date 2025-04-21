import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class AddAttachedCvDto {
  @IsNotEmpty({ message: 'Tên CV không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'URL CV không được để trống' })
  @IsUrl({}, { message: 'URL không hợp lệ' })
  url: string;
} 