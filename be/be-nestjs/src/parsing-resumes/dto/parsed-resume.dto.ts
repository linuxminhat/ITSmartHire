import { IsString, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator';

export class ParsedResumeDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    github?: string;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    university?: string;

    @IsString()
    @IsOptional()
    degree?: string;

    @IsString()
    @IsOptional()
    gpa?: string;

    @IsArray()
    @IsOptional()
    workExperiences?: {
        company: string;
        position: string;
        duration: string;
        description: string[];
    }[];

    @IsArray()
    @IsOptional()
    projects?: {
        name: string;
        description: string[];
    }[];

    @IsArray()
    @IsOptional()
    skills: string[];

    @IsArray()
    @IsOptional()
    certifications?: string[];
}