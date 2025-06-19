
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'username' });
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.authService.validateUser(username, password);//validateUser in auth.service
        console.log('[DEBUG] LocalStrategy user:', user);
        console.log('[LocalStrategy] Email:', username);
        console.log('[LocalStrategy] Password:', password);
        if (!user) {
            throw new UnauthorizedException("Tên đăng nhập / Mật khẩu không hợp lệ");
        }
        return user;
    }
}
