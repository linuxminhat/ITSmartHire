import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { DeviceToken, DeviceTokenDocument } from './schemas/device-token.schema';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { IUser } from '../users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>
    ) { }

    async getUserNotifications(user: IUser, currentPage: number, limit: number, qs: string) {
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        const offset = (currentPage - 1) * limit;
        const defaultLimit = limit || 10;

        // Lọc theo userId
        const queryFilter = { ...filter, userId: new mongoose.Types.ObjectId(user._id) };

        const totalItems = await this.notificationModel.countDocuments(queryFilter);
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.notificationModel.find(queryFilter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any || { createdAt: -1 })
            .populate(population as any)
            .exec();

        return {
            meta: {
                current: currentPage,
                pageSize: defaultLimit,
                pages: totalPages,
                total: totalItems
            },
            result
        };
    }

    async countUnreadNotifications(user: IUser) {
        const count = await this.notificationModel.countDocuments({
            userId: new mongoose.Types.ObjectId(user._id),
            isRead: false
        });

        return { count };
    }


    async pushToUserDevices(
        userId: string,
        payload: { title: string; body: string },
    ) {
        // 1) Lấy toàn bộ token của user
        const docs = await this.deviceTokenModel
            .find({ userId: new mongoose.Types.ObjectId(userId) })
            .select('token -_id');
        const tokens = docs.map((d) => d.token);
        if (!tokens.length) return;

        // 2) Gửi multicast
        const res = await getMessaging().sendEachForMulticast({
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
        });

        // 3) Xoá token hỏng để tránh gửi lại lần sau
        if (res.failureCount) {
            const invalid: string[] = [];
            res.responses.forEach((r, i) => {
                if (
                    !r.success &&
                    (r.error?.code === 'messaging/invalid-registration-token' ||
                        r.error?.code === 'messaging/registration-token-not-registered')
                ) {
                    invalid.push(tokens[i]);
                }
            });
            if (invalid.length) {
                await this.deviceTokenModel.deleteMany({ token: { $in: invalid } });
            }
        }
    }
    async markAsRead(id: string, user: IUser) {
        await this.notificationModel.updateOne(
            { _id: id, userId: new mongoose.Types.ObjectId(user._id) },
            { isRead: true }
        );

        return { success: true };
    }

    async markAllAsUnread(user: IUser) {
        await this.notificationModel.updateMany(
            { userId: new mongoose.Types.ObjectId(user._id) },
            { isRead: false }
        );

        return { success: true };
    }
    async markAllAsRead(user: IUser) {
        await this.notificationModel.updateMany(
            { userId: new mongoose.Types.ObjectId(user._id) },
            { isRead: true }
        );
        return { success: true };
    }

    async registerDeviceToken(registerDeviceDto: RegisterDeviceDto, user: IUser) {
        const { token } = registerDeviceDto;

        // Tìm và cập nhật token hiện có hoặc tạo mới
        await this.deviceTokenModel.findOneAndUpdate(
            { userId: new mongoose.Types.ObjectId(user._id), token },
            { lastActive: new Date() },
            { upsert: true, new: true }
        );

        return { success: true };
    }

    async createNotificationForApplication(applicationId: string, jobId: string, userId: string, companyName: string, status: string) {
        let message = 'Hồ sơ của bạn đã được cập nhật trạng thái mới';

        // Tạo thông báo dựa theo trạng thái
        if (status === 'reviewed') message = 'Hồ sơ của bạn đã được xem xét';
        if (status === 'offered') message = 'Bạn đã được mời phỏng vấn';
        if (status === 'accepted') message = 'Đơn ứng tuyển của bạn đã được chấp nhận';
        if (status === 'rejected') message = 'Đơn ứng tuyển của bạn đã bị từ chối';

        await this.notificationModel.create({
            userId: new mongoose.Types.ObjectId(userId),
            applicationId: new mongoose.Types.ObjectId(applicationId),
            jobId: new mongoose.Types.ObjectId(jobId),
            companyName,
            status,
            message,
            isRead: false
        });
    }

}

