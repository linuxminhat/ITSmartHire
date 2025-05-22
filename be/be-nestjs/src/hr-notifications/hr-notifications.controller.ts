import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { HRNotificationsService } from './hr-notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guards';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
@UseGuards(JwtAuthGuard)
@Controller('hr-notifications')
export class HRNotificationsController {
    constructor(private readonly hrNotificationsService: HRNotificationsService) { }

    @Get()
    @ResponseMessage('Lấy danh sách thông báo cho HR thành công')
    async getHRNotifications(
        @User() user: IUser,
        @Query('current') currentPage: string = '1',
        @Query('pageSize') limit: string = '10',
        @Query() qs: string
    ) {
        return this.hrNotificationsService.getHRNotifications(
            user,
            +currentPage,
            +limit,
            qs
        );
    }

    @Get('unread-count')
    @ResponseMessage('Lấy số thông báo chưa đọc cho HR thành công')
    async getUnreadCount(@User() user: IUser) {
        return this.hrNotificationsService.countUnreadHRNotifications(user);
    }

    @Patch(':id/read')
    @ResponseMessage('Đánh dấu thông báo HR đã đọc thành công')
    async markAsRead(@Param('id') id: string, @User() user: IUser) {
        return this.hrNotificationsService.markAsRead(id, user);
    }

    @Patch('read-all')
    @ResponseMessage('Đánh dấu tất cả thông báo HR đã đọc thành công')
    async markAllAsRead(@User() user: IUser) {
        return this.hrNotificationsService.markAllAsRead(user);
    }
}