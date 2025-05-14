import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ArrayUnique } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
    @IsString() @IsNotEmpty() name: string;

    @IsOptional() @IsString() description?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @Type(() => String)
    skills?: string[];
}
