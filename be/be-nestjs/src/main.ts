// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(3000);

// }
//bootstrap()
// import { NestFactory } from '@nestjs/core';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { join } from 'path';
// import { AppModule } from './app.module';
// async function bootstrap() {
//     const app = await NestFactory.create<NestExpressApplication>(AppModule);
//     app.useStaticAssets(join(__dirname, "..", "public"));
//     app.setBaseViewsDir(join(__dirname, "..", "views"));
//     app.setViewEngine("ejs");
//     await app.listen(3000);
// }
// bootstrap();
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth-guards';
require('dotenv').config();
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const reflector = app.get(Reflector);
    // app.useGlobalGuards(new JwtAuthGuard(reflector));
    app.useStaticAssets(join(__dirname, "..", "public"));//js/css/images
    app.setBaseViewsDir(join(__dirname, "..", "views"));//view 
    app.setViewEngine("ejs");
    // await app.listen(process.env.PORT);
    await app.listen(configService.get<string>('PORT'));
    // await app.listen(3000);
    app.useGlobalPipes(new ValidationPipe());

}
bootstrap();