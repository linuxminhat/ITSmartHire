import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { DeviceToken, DeviceTokenSchema } from './schemas/device-token.schema';
import { FirebaseAdminProvider } from 'src/common/firebase-admin.provider';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: DeviceToken.name, schema: DeviceTokenSchema }
        ])
    ],
    controllers: [NotificationsController],
    providers: [FirebaseAdminProvider, NotificationsService],
    exports: [NotificationsService]
})
export class NotificationsModule { }