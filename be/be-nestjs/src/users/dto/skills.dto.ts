import { IsArray, IsString, IsOptional } from 'class-validator';

export class UpdateSkillsDto {
    @IsOptional()
    @IsArray({ message: 'Kỹ năng phải là một mảng' })
    @IsString({ each: true, message: 'Mỗi kỹ năng phải là một chuỗi' })
    skills: string[];
} 