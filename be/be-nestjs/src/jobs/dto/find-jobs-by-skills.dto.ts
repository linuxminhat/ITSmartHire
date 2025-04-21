import { IsArray, IsMongoId, ArrayNotEmpty } from 'class-validator';

export class FindJobsBySkillsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true, message: 'Each skill must be a valid MongoDB ObjectId' })
  skills: string[];
} 