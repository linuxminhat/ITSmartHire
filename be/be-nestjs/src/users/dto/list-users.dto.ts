import { IsOptional, IsString, IsNumberString, MinLength } from 'class-validator';

export class ListUsersDto {
    @IsOptional() @IsNumberString() current?: string;
    @IsOptional() @IsNumberString() pageSize?: string;

    @IsOptional() @IsString() @MinLength(1)
    name?: string;

    @IsOptional() @IsString()
    email?: string;           // ⬅️ mới

    @IsOptional() @IsString()
    role?: string;            // ⬅️ mới


}
