import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';
import { FilesModule } from './files/files.module';
import { ResumesModule } from './resumes/resumes.module';
import { RolesModule } from './roles/roles.module';
import { DatabasesModule } from './databases/databases.module';
import { SkillsModule } from './skills/skills.module';
import { CategoriesModule } from './categories/categories.module';
import { ApplicationsModule } from './applications/applications.module';
import { BlogsModule } from './blogs/blogs.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    //Note : forRootAsync function ! 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<String>("MONGO_URL"),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        }
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    //Auto update

    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    FilesModule,
    ResumesModule,
    RolesModule,
    DatabasesModule,
    SkillsModule,
    CategoriesModule,
    ApplicationsModule,
    BlogsModule,
    NotificationsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {

}