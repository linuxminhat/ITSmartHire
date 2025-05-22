import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type DeviceTokenDocument = DeviceToken & Document;

@Schema({ timestamps: true })
export class DeviceToken {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true })
    token: string;

    @Prop({ default: () => new Date() })
    lastActive: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);