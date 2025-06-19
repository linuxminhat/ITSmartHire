import { IsEmail, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEventDto {
    @IsString() @MinLength(3) title: string;
    //client email 
    @IsEmail() candidateEmail: string;
    //ISO format : "2025-06-30T10:00:00Z"
    @IsISO8601() start: string;
    @IsISO8601() end: string;
    @IsOptional() @IsString() tz?: string = '+00:00';
    @IsOptional() @IsString() meetLink?: string;
    @IsOptional() @IsString() note?: string;
    @IsString() @MinLength(2) hrName: string;
    @IsString() @MinLength(2) companyName: string;
    @IsOptional() @IsString() personalMessage?: string;
}
