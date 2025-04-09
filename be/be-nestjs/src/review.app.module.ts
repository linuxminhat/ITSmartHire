
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';

// @Module({
//     imports: [MongooseModule.forRoot('mongodb://localhost/nest')],
// })
// export class AppModule { }
// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// @Module({
//     imports: [
//         MongooseModule.forRoot('mongodb://localhost/nestjs'),
//     ]
// })
// export class AppModule {

// }
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
@Module({
    imports: [ConfigModule.forRoot()],
})
export class ReviewAppModule {

}