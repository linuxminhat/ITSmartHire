import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { StatefulService } from '@/stateful/stateful.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly statefulService: StatefulService) {
        super();
    }
    async validate(username: string, password: string) {
        const userName = username.toLowerCase();
        const user = await this.statefulService.validateUserStateful(userName, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}