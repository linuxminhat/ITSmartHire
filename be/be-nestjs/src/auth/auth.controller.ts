
import { Get, Controller, Render, Post, UseGuards, Body, Res, Req, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth-guards';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { PassThrough } from 'stream';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
@Controller("auth")
export class AuthController {
    //port from .env
    constructor(
        private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ResponseMessage("User Login ")
    handleLogin(@Req() req: any, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }
    // @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
        return req.user;
    }

    //Public for not using JSON WEB TOKEN
    @Public()
    @ResponseMessage('Register a new user')
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }
    @ResponseMessage("Get user information")
    @Get('/account')
    handleGetAccount(@User() user: IUser) { //Get from req.user
        return { user };
    }


}