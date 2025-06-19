import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillDto } from './create-skill.dto';

//reuse but optional 
export class UpdateSkillDto extends PartialType(CreateSkillDto) { } 