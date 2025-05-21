import { Controller, Get, Patch, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { IUser } from '../users/users.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';
import { ResponseMessage, User } from 'src/decorator/customize';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ResponseMessage('Lấy danh sách thông báo thành công')
    async getUserNotifications(
        @User() user: IUser,
        @Query('current') currentPage: string = '1',
        @Query('pageSize') limit: string = '10',
        @Query() qs: string
    ) {
        return this.notificationsService.getUserNotifications(
            user,
            +currentPage,
            +limit,
            qs
        );
    }

    @Get('unread-count')
    @ResponseMessage('Lấy số thông báo chưa đọc thành công')
    async getUnreadCount(@User() user: IUser) {
        return this.notificationsService.countUnreadNotifications(user);
    }

    @Patch(':id/read')
    @ResponseMessage('Đánh dấu thông báo đã đọc thành công')
    async markAsRead(@Param('id') id: string, @User() user: IUser) {
        return this.notificationsService.markAsRead(id, user);
    }

    @Patch('read-all')
    @ResponseMessage('Đánh dấu tất cả thông báo đã đọc thành công')
    async markAllAsRead(@User() user: IUser) {
        return this.notificationsService.markAllAsRead(user);
    }

    @Post('register-device')
    @ResponseMessage('Đăng ký token thiết bị thành công')
    async registerDeviceToken(
        @Body() registerDeviceDto: RegisterDeviceDto,
        @User() user: IUser
    ) {
        return this.notificationsService.registerDeviceToken(registerDeviceDto, user);
    }
}
