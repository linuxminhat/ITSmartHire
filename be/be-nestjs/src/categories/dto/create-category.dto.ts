import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
    name: string;

    // Optional: Add description if needed
    // @IsOptional()
    // @IsString()
    // description: string;
} 