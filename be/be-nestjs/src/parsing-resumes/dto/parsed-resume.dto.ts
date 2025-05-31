import { IsString, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export class ParsedResumeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    university?: string;

    @IsString()
    @IsOptional()
    github?: string;

    @IsArray()
    @ArrayNotEmpty()
    skills: string[];

    @IsString()
    @IsOptional()
    email?: string;

    @IsArray()
    @IsOptional()
    certifications?: string[];
}
