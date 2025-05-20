export const ALLOWED_BLOG_TAGS = [
  'Sự nghiệp IT',
  'Ứng tuyển và thăng tiến',
  'Chuyên môn IT',
  'Chuyện IT',
] as const;
export type BlogTag = typeof ALLOWED_BLOG_TAGS[number];

import { IsNotEmpty, IsString, IsOptional, IsArray, IsMongoId, ArrayNotEmpty, ArrayUnique, IsIn } from 'class-validator';

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
  // @ArrayNotEmpty({ message: 'Phải chọn ít nhất một tag.' })
  @ArrayUnique({ message: 'Không được chọn trùng tag.' })
  @IsIn(ALLOWED_BLOG_TAGS, {
    each: true,
    message: 'Tag "$value" không hợp lệ.',
  })
  tags?: BlogTag[];

  @IsOptional()
  metaData?: Record<string, any>;
} 