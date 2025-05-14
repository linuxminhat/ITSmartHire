import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSkillDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
    name: string;
    @IsString() category: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsBoolean() isActive?: boolean;
} 