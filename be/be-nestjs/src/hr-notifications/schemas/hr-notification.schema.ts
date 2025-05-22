import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type HRNotificationDocument = HRNotification & Document;

@Schema({ timestamps: true })
export class HRNotification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    hrId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Application' })
    applicationId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
    jobId: mongoose.Schema.Types.ObjectId;

    @Prop()
    jobName: string;

    @Prop()
    candidateName: string;

    @Prop()
    candidateEmail: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop()
    message: string;
}

export const HRNotificationSchema = SchemaFactory.createForClass(HRNotification);
HRNotificationSchema.index({ hrId: 1, createdAt: -1 });