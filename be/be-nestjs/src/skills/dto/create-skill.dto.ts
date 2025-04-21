import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSkillDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên kỹ năng không được để trống' })
    name: string;

    // Optional: Add description if needed
    // @IsOptional()
    // @IsString()
    // description: string;
} 