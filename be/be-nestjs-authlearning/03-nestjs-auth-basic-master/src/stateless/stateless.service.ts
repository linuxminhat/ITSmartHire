import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StatelessService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUserStateless(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(username);
        if (!user) {
            return null;
        }
        const isValidPassword = this.usersService.checkPassword(pass, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedException();
        }
        return user;
    }

    async login(user: any) {
        const payload = { username: user.email, sub: user._id, name: user.name };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}