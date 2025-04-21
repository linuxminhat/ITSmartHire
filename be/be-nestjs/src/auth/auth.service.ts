import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';


@Injectable()
export class AuthService {

    constructor(private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService
    ) { }

    //Run when login
    //passport take username and password
    async validateUser(username: string, pass: string): Promise<any> {

        const user = await this.usersService.findOneByUserName(username);
        //First you need login successfully
        //Correct email -> then user.password
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid === true) {

                const objUser = {
                    ...user.toObject(),
                }
                return objUser;
            }
        }
        return null;
    }

    async login(user: IUser, response: Response) {

        const { _id, name, email, role } = user;
        //Define what you want in payload
        const payload = {
            //subtitle
            sub: "token login",
            //issuer
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        const refresh_token = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refresh_token, _id);
        //set refresh_token as cookies 
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms((this.configService.get<string>("JWT_REFRESH_EXPIRE")))
        })

        return {

            access_token: this.jwtService.sign(payload),
            refresh_token,
            user: {
                _id,
                name,
                email,
                role,
            }

        };

    }

    //register a new user 
    async register(user: RegisterUserDto) {
        //Inject usersService for interacting with database
        let newUser = await this.usersService.register(user);
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt
        };
    }

    //create a new refresh token
    createRefreshToken = (payload: any) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: ms(this.configService.get<string>("JWT_REFRESH_EXPIRE")) / 1000,
        });
        return refresh_token;
    }
    processNewToken = async (refreshToken: string, response: Response) => {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
            })
            //To do here !
            let user = await this.usersService.findUserbyToken(refreshToken);
            if (user) {
                const { _id, name, email, role } = user;
                const payload = {
                    //subtitle
                    sub: "token refresh",
                    //issuer
                    iss: "from server",
                    _id,
                    name,
                    email,
                    role
                };
                const refresh_token = this.createRefreshToken(payload);

                await this.usersService.updateUserToken(refresh_token, _id.toString());
                //fetch user role 
                response.clearCookie("refresh_token");
                //set refresh_token as cookies 
                response.cookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    maxAge: ms((this.configService.get<string>("JWT_REFRESH_EXPIRE"))) * 1000
                })

                return {
                    access_token: this.jwtService.sign(payload),
                    user: {
                        _id,
                        name,
                        email,
                        role,
                    }

                };
            } else {
                throw new BadRequestException("Refresh Token không hợp lệ . Vui lòng login")
            }
        } catch (error) {
            throw new BadRequestException("Refresh Token không hợp lệ . Vui lòng login")
        }
    }
    logout = async (response: Response, user: IUser) => {
        await this.usersService.updateUserToken("", user._id);
        response.clearCookie("refresh token");
        return "ok";
    }
}