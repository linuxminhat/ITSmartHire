import { IsNotEmpty, IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  metaData?: Record<string, any>;
} 