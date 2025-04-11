
import { Get, Controller, Render, Post, UseGuards, Request, Body, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth-guards';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
@Controller("auth")
export class AuthController {
    //port from .env
    constructor(
        private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ResponseMessage("User Login ")
    handleLogin(@Request() req) {
        return this.authService.login(req.user);
    }
    // @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    //Public for not using JSON WEB TOKEN
    @Public()
    @ResponseMessage('Register a new user')
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

}