import {
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();
        // You can throw an exception based on either "info" or "err" arguments
        if (err || !user) {
            throw err || new UnauthorizedException("Token không hợp lệ");
        }
        // //check permissions 
        // const targetMethod = request.method;
        // const targetEndpoint = request.route?.path;

        // const permissions = user?.permissions ?? [];
        // const isExist = permissions.find(permission =>
        //     targetMethod === permission.method
        //     &&
        //     (targetEndpoint === permission.apiPath ||
        //         targetEndpoint.includes(permission.apiPath) ||
        //         permission.apiPath.includes(targetEndpoint))
        // );
        // if (!isExist) {
        //     throw new ForbiddenException("Bạn không có quyền truy cập endpoint này ")
        // }
        return user;
    }
}