import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HRNotification, HRNotificationDocument } from './schemas/hr-notification.schema';
import { IUser } from '../users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { getMessaging } from 'firebase-admin/messaging';
import { DeviceToken, DeviceTokenDocument } from '../notifications/schemas/device-token.schema';

@Injectable()
export class HRNotificationsService {
    constructor(
        @InjectModel(HRNotification.name) private hrNotificationModel: Model<HRNotificationDocument>,
        @InjectModel(DeviceToken.name) private deviceTokenModel: Model<DeviceTokenDocument>
    ) { }

    async getHRNotifications(hr: IUser, currentPage: number, limit: number, qs: string) {
        console.log(`[DEBUG] getHRNotifications called for HR: ${hr.name} (${hr._id})`);
        
        const { filter, sort, population } = aqp(qs);
        delete filter.current;
        delete filter.pageSize;

        const offset = (currentPage - 1) * limit;
        const defaultLimit = limit || 10;

        const queryFilter = { ...filter, hrId: new mongoose.Types.ObjectId(hr._id) };
        console.log('[DEBUG] Query filter:', queryFilter);

        const totalItems = await this.hrNotificationModel.countDocuments(queryFilter);
        console.log(`[DEBUG] Found ${totalItems} total notifications`);
        
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.hrNotificationModel.find(queryFilter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any || { createdAt: -1 })
            .populate(population as any)
            .exec();

        console.log(`[DEBUG] Returning ${result.length} notifications for current page`);
        
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

    async countUnreadHRNotifications(hr: IUser) {
        const count = await this.hrNotificationModel.countDocuments({
            hrId: new mongoose.Types.ObjectId(hr._id),
            isRead: false
        });

        return { count };
    }

    async markAsRead(id: string, hr: IUser) {
        await this.hrNotificationModel.updateOne(
            { _id: id, hrId: new mongoose.Types.ObjectId(hr._id) },
            { isRead: true }
        );

        return { success: true };
    }

    async markAllAsRead(hr: IUser) {
        await this.hrNotificationModel.updateMany(
            { hrId: new mongoose.Types.ObjectId(hr._id) },
            { isRead: true }
        );

        return { success: true };
    }

    async createHRNotification(applicationId: string, jobId: string, hrId: string, jobName: string, candidateName: string, candidateEmail: string, resumeInfo?: { education?: string; experience?: number }) {
        console.log(`[DEBUG] createHRNotification called with hrId: ${hrId}, applicationId: ${applicationId}`);
        
        // Tạo thông báo chi tiết hơn về CV mới
        let message = `Ứng viên ${candidateName} đã ứng tuyển vào vị trí "${jobName}"`;
        
        // Thêm thông tin về kinh nghiệm nếu có
        if (resumeInfo?.experience !== undefined) {
            message += ` với ${resumeInfo.experience} năm kinh nghiệm`;
        }

        // Thêm thông tin về học vấn nếu có
        if (resumeInfo?.education) {
            message += `, trình độ ${resumeInfo.education}`;
        }

        console.log(`[DEBUG] Creating HR notification in database with message: ${message}`);
        
        try {
            const notification = await this.hrNotificationModel.create({
                hrId: new mongoose.Types.ObjectId(hrId),
                applicationId: new mongoose.Types.ObjectId(applicationId),
                jobId: new mongoose.Types.ObjectId(jobId),
                jobName,
                candidateName,
                candidateEmail,
                message,
                isRead: false
            });
            
            console.log(`[DEBUG] HR notification created in database: ${notification._id}`);

            // Gửi thông báo qua Firebase với tiêu đề cụ thể hơn
            console.log(`[DEBUG] Sending push notification to HR devices`);
            await this.pushToHRDevices(hrId, {
                title: 'Hồ sơ ứng tuyển mới cho ' + jobName,
                body: message
            });
            
            console.log(`[DEBUG] Push notification sent successfully`);

            return notification;
        } catch (error) {
            console.error(`[ERROR] Failed to create HR notification:`, error);
            throw error;
        }
    }

    async pushToHRDevices(hrId: string, payload: { title: string; body: string }) {
        // Lấy danh sách token của HR từ deviceToken collection
        const tokens = await this.deviceTokenModel
            .find({ userId: hrId })
            .lean()
            .select('token -_id')
            .then(docs => docs.map(d => d.token));
        if (!tokens.length) return;

        // Gửi thông báo qua Firebase
        const res = await getMessaging().sendEachForMulticast({
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
        });

        // Xử lý token không hợp lệ
        if (res.failureCount) {
            const invalid: string[] = [];
            res.responses.forEach((r, i) => {
                if (!r.success &&
                    (r.error?.code === 'messaging/invalid-registration-token' ||
                        r.error?.code === 'messaging/registration-token-not-registered')) {
                    invalid.push(tokens[i]);
                }
            });
            if (invalid.length) {
                await this.deviceTokenModel.deleteMany({ token: { $in: invalid } });
            }
        }
    }
}