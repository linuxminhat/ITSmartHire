import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseDelete from 'soft-delete-plugin-mongoose';
import { Category } from 'src/categories/schemas/category.schema';
import { Skill } from 'src/skills/schemas/skill.schema';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
    @Prop()
    name: string;
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    hrId: mongoose.Schema.Types.ObjectId;
    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Skill' })
    skills: Skill[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
    category: Category;

    @Prop({ type: Object })
    company: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
        logo: string;
    }

    @Prop()
    location: string;

    @Prop()
    salary: number;
    @Prop()
    quantity: number;
    @Prop()
    level: string;
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



