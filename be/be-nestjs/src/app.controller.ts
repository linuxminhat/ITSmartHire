
import { Get, Controller, Render, Post, UseGuards, Request, } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local-auth-guards';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth-guards';
import { Public } from './decorator/customize';
@Controller()
export class AppController {
  //port from .env

  constructor(private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService) { }


}