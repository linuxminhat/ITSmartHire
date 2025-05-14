import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class ListCategoriesDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    skill?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    current?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    pageSize?: number;
}
