// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { DeviceToken, DeviceTokenSchema } from './schemas/device-token.schema';
import { FirebaseAdminModule } from 'src/common/firebase-admin.module';

@Module({
    imports: [
        FirebaseAdminModule,
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: DeviceToken.name, schema: DeviceTokenSchema },
        ]),
    ],
    controllers: [NotificationsController],
    providers: [
        NotificationsService,
    ],
    exports: [NotificationsService],
})
export class NotificationsModule { }
