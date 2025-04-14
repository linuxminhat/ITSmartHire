import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseDelete from 'soft-delete-plugin-mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
    @Prop()
    name: string;
    @Prop()
    skills: string[];

    @Prop({ type: Object })
    company: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
    }

    @Prop()
    location: string;
    @Prop()
    salary: number;
    @Prop()
    quantity: number;
    @Prop()
    level: string;
    //HTML type 
    @Prop()
    description: string;

    @Prop()
    startDate: Date;
    @Prop()
    endDate: Date;
    @Prop()
    isActive: boolean;
    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }
    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }
    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
    @Prop()
    isDeleted: boolean;
    @Prop()
    deletedAt: Date;

}
export const JobSchema = SchemaFactory.createForClass(Job);



