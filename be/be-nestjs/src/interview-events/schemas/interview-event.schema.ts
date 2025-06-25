// interview-event.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class InterviewEvent extends Document {
    @Prop({ required: true }) title: string;
    @Prop({ required: true }) candidateEmail: string;
    @Prop({ required: true }) start: Date;
    @Prop({ required: true }) end: Date;
    @Prop() meetLink?: string;
    @Prop() note?: string;
    @Prop({ default: '+00:00' }) tz: string;
    @Prop({ default: 'pending', enum: ['pending', 'accepted', 'declined'] })
    status: 'pending' | 'accepted' | 'declined';
    @Prop({ required: true }) hrId: string;

    // 3 trường mới
    @Prop({ required: true }) hrName: string;
    @Prop({ required: true }) companyName: string;
    @Prop() personalMessage?: string;
}

export const InterviewEventSchema = SchemaFactory.createForClass(InterviewEvent);