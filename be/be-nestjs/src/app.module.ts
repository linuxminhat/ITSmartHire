// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [AppModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule { }
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';

@Module({
  imports: [
    // imports: [MongooseModule.forRoot('mongodb+srv://minhnhatdang2810:sdytrkRaJ0AReGca@cluster0.k737ddv.mongodb.net/'),
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

  ],

  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {

}