import { UsersService } from "@/users/users.service";
import { Injectable } from "@nestjs/common"
import { PassportSerializer } from "@nestjs/passport"

@Injectable()
export class SessionSerializer extends PassportSerializer {
    constructor(private readonly usersService: UsersService) {
        super();
    }

    // The serializeUser function determines the data stored inside of the session. In our case, we only store :{_id, email, name}
    serializeUser(user: any, done: Function) {
        done(null, user.email);
    }

    // The result of the deserializeUser function gets attached to the request object.
    async deserializeUser(username: string, done: Function) {
        const user = await this.usersService.findByEmail(username);

        if (!user) {
            return done(
                `Could not deserialize user: user with ${username} could not be found`,
                null,
            );
        }

        done(null, user);
    }
}