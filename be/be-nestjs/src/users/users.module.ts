import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.shema';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabasesModule } from 'src/databases/databases.module';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [DatabasesModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Role.name, schema: RoleSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule { }
