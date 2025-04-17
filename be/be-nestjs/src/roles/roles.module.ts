import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])]
})
export class RolesModule { }
