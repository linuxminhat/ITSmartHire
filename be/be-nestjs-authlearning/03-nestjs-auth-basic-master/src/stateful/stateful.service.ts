import { UsersService } from '@/users/users.service';
import { Injectable, NotAcceptableException } from '@nestjs/common';

@Injectable()
export class StatefulService {
    constructor(private readonly usersService: UsersService) { }

    async validateUserStateful(username: string, password: string) {

        const user = await this.usersService.findByEmail(username);
        if (!user) {
            throw new NotAcceptableException(`could not find the user with username = ${username}`);
        }
        const passwordValid = this.usersService.checkPassword(password, user.password)
        if (!passwordValid) {
            throw new NotAcceptableException('wrong password');
        }
        if (user) {
            return {
                _id: user._id,
                email: user.email,
                name: user.name
            };
        }
        return null;
    }
}
