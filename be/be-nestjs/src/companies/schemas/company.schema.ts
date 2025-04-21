import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import * as mongooseDelete from 'soft-delete-plugin-mongoose';
import { Skill } from 'src/skills/schemas/skill.schema';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
    @Prop()
    name: string;
    @Prop()
    address: string;
    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    @Prop()
    description: string;

    @Prop()
    logo: string;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Skill' })
    skills: Skill[];

    @Prop()
    specializationDescription: string;

    @Prop()
    companyModel: string;

    @Prop()
    industry: string;

    @Prop()
    companySize: string;

    @Prop()
    country: string;

    @Prop()
    workingTime: string;

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
export const CompanySchema = SchemaFactory.createForClass(Company);
