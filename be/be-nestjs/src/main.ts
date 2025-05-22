import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth-guards';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { JobsService } from './jobs/jobs.service';

require('dotenv').config();
async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector));

    app.useStaticAssets(join(__dirname, "..", "public"));//js/css/images
    app.setBaseViewsDir(join(__dirname, "..", "views"));//view 
    app.setViewEngine("ejs");
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor(reflector));
    // const cookieParser = require('cookie-parser');


    //config cookie 
    app.use(cookieParser());

    //config CORS

    app.enableCors(
        {
            "origin": true,
            "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
            "preflightContinue": false,
            credentials: true
            // "optionsSuccessStatus": 204
        }
    );

    // or "app.enableVersioning()"
    app.setGlobalPrefix('api');
    app.enableVersioning({

        type: VersioningType.URI,
        // prefix: 'api/v',
        defaultVersion: ['1', '2']
    });

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Run the job migrations
    try {
        console.log('[STARTUP] Running job migrations to fix missing hrId fields');
        const jobsService = app.get(JobsService);
        const result = await jobsService.fixMissingHrIds();
        console.log('[STARTUP] Migration result:', result);
    } catch (error) {
        console.error('[STARTUP] Error running migrations:', error);
    }

    await app.listen(configService.get<string>('PORT'));
}
bootstrap();