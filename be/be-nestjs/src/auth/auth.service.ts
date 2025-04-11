import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }
    async validateUser(username: string, pass: string): Promise<any> {
        console.log('[Login] username:', username);

        const user = await this.usersService.findOneByUserName(username);
        console.log('[Login] user:', user);

        //First you need login successfully
        if (user) {
            const isValid = this.usersService.isValidPassword(pass, user.password);
            if (isValid === true) {
                return user;
            }
            return null;
        }
    }
    async login(user: IUser) {

        const { _id, name, email, role } = user;
        const payload = {
            sub: "token login",
            iss: "from server",
            _id,
            name,
            email,
            role
        };
        const refresh_token = this.createRefreshToken({ payload });
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token,
            user: {
                _id,
                name,
                email,
                role

            }

        };

    }
    async register(user: RegisterUserDto) {
        let newUser = await this.usersService.register(user);
        return {
            _id: newUser?._id,
            createdAt: newUser?.createdAt
        };
    }
    createRefreshToken = (payload) => {
        const refresh_token = this.jwtService.sign(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRE"),
        });
        return refresh_token;
    }
}