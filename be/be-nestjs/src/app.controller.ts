
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
  @Get()
  @Render('views')
  root() {
    console.log(">>check port=", this.configService.get<string>('PORT'));
    console.log(">>port", this.configService.get<String>('PORT'));

    return { message: "Hello Worlds" };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }
  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

}