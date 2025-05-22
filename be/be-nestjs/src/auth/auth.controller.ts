import { Get, Controller, Render, Post, UseGuards, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth-guards';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { PassThrough } from 'stream';
import { Response, response } from 'express';
import { IUser } from 'src/users/users.interface';
import { Request } from 'express';
import { RolesService } from 'src/roles/roles.service';

@Controller("auth")
export class AuthController {
    //port from .env
    constructor(
        private authService: AuthService, private rolesService: RolesService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ResponseMessage("User Login ")
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
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
    async handleGetAccount(@User() user: IUser) { //Get from req.user
        // Kiểm tra nếu user.role không tồn tại hoặc null
        if (!user.role) {
            console.error("User role is null or undefined", user._id);
            // Trả về thông tin user nhưng không có permissions
            return { user: { ...user, permissions: [] } };
        }
        
        try {
            const temp = await this.rolesService.findOne(user.role._id) as any;
            user.permissions = temp?.permissions || [];
            return { user };
        } catch (error) {
            console.error("Error getting role permissions:", error);
            // Fallback trả về user không có permissions
            return { user: { ...user, permissions: [] } };
        }
    }

    @Public()
    @ResponseMessage("Get user by refresh token")
    @Get('/refresh')
    handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) { //Get from req.user
        const refreshToken = request.cookies["refresh_token"];
        return this.authService.processNewToken(refreshToken, response);
    }

    @ResponseMessage("Logout user")
    @Post('/logout')
    handleLogout(
        @Res({ passthrough: true }) response: Response,
        @User() user: IUser
    ) {
        return this.authService.logout(response, user);
    }

}