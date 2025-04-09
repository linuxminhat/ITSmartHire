import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService
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
    async login(user: any) {
        const payload = { username: user.email, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}