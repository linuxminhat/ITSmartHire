import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Application' })
    applicationId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
    jobId: mongoose.Schema.Types.ObjectId;

    @Prop()
    companyName: string;

    @Prop()
    status: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    message: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);