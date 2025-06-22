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
import { UsersService } from 'src/users/users.service';

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService, private rolesService: RolesService, private usersService: UsersService) { }

    @Public() //Bo qua JWTAuthGuard
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ResponseMessage("User Login ")
    handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }
    @Public()
    @ResponseMessage('Register a new user')
    @Post('/register')
    handleRegister(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    //Lay thong tin nguoi dung
    @ResponseMessage("Get user information")
    @Get('/account')
    async handleGetAccount(@User() user: IUser) {
        if (!user.role) {
            console.error("User role is null or undefined", user._id);
            return { user: { ...user, permissions: [] } };
        }

        try {
            // Lấy thông tin đầy đủ của user từ database (bao gồm designation)
            const fullUserProfile = await this.usersService.findUserProfile(user._id);
            if (!fullUserProfile || typeof fullUserProfile === 'string') {
                throw new Error('User profile not found');
            }

            // Lấy permissions từ role
            const temp = await this.rolesService.findOne(user.role._id) as any;
            const permissions = temp?.permissions || [];

            // Trả về user data đầy đủ
            return { 
                user: {
                    ...fullUserProfile.toObject(), // Chứa designation và các field khác
                    permissions
                }
            };
        } catch (error) {
            console.error("Error getting user account info:", error);
            // Fallback: trả về user data từ token
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