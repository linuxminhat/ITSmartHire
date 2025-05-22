// src/hr-notifications/hr-notifications.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HRNotificationsController } from './hr-notifications.controller';
import { HRNotificationsService } from './hr-notifications.service';
import {
    HRNotification,
    HRNotificationSchema,
} from './schemas/hr-notification.schema';
import {
    DeviceToken,
    DeviceTokenSchema,
} from '../notifications/schemas/device-token.schema';
import { FirebaseAdminModule } from 'src/common/firebase-admin.module';

@Module({
    imports: [
        FirebaseAdminModule,
        MongooseModule.forFeature([
            { name: HRNotification.name, schema: HRNotificationSchema },
            { name: DeviceToken.name, schema: DeviceTokenSchema },
        ]),
    ],
    controllers: [HRNotificationsController],
    providers: [
        HRNotificationsService,
    ],
    exports: [HRNotificationsService],
})
export class HRNotificationsModule { }
