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

    app.useStaticAssets(join(__dirname, "..", "public"));
    app.setBaseViewsDir(join(__dirname, "..", "views"));
    app.setViewEngine("ejs");
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        disableErrorMessages: false,
    }));
    app.useGlobalInterceptors(new TransformInterceptor(reflector));
    app.use(cookieParser());
    app.enableCors(
        {
            "origin": true,
            "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
            "preflightContinue": false,
            credentials: true
        }
    );
    app.setGlobalPrefix('api');
    app.enableVersioning({

        type: VersioningType.URI,
        defaultVersion: ['1', '2']
    });
    //using 2 middlewares
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
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