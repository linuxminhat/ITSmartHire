import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Skill, SkillSchema } from './schemas/skill.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Skill.name, schema: SkillSchema }])],
  controllers: [SkillsController],
  providers: [SkillsService],
  // exports: [SkillsService] // Export if needed by other modules
})
export class SkillsModule {} 