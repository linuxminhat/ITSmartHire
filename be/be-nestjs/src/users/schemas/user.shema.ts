import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';
import { Company } from 'src/companies/schemas/company.schema';

@Schema({ _id: true, timestamps: true })
export class Education {
    @Prop({ required: true })
    school: string;

    @Prop({ required: true })
    degree: string;

    @Prop()
    fieldOfStudy?: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop()
    endDate?: Date;

    @Prop()
    description?: string;
}
export const EducationSchema = SchemaFactory.createForClass(Education);

@Schema({ _id: true, timestamps: true })
export class Experience {
    @Prop({ required: true })
    companyName: string;

    @Prop({ required: true })
    jobTitle: string;

    @Prop()
    location?: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop()
    endDate?: Date;

    @Prop()
    description?: string;
}
export const ExperienceSchema = SchemaFactory.createForClass(Experience);

@Schema({ _id: true, timestamps: true })
export class Project {
    @Prop({ required: true })
    name: string;

    @Prop()
    url?: string;

    @Prop()
    startDate?: Date;

    @Prop()
    endDate?: Date;

    @Prop()
    description?: string;

    @Prop({ type: [String] })
    technologiesUsed?: string[];
}
export const ProjectSchema = SchemaFactory.createForClass(Project);

@Schema({ _id: true, timestamps: true })
export class Certificate {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    issuingOrganization: string;

    @Prop()
    issueDate?: Date;

    @Prop()
    expirationDate?: Date;

    @Prop()
    credentialId?: string;

    @Prop()
    credentialUrl?: string;
}
export const CertificateSchema = SchemaFactory.createForClass(Certificate);

@Schema({ _id: true, timestamps: true })
export class Award {
    @Prop({ required: true })
    title: string;

    @Prop()
    issuer?: string;

    @Prop()
    issueDate?: Date;

    @Prop()
    description?: string;
}
export const AwardSchema = SchemaFactory.createForClass(Award);

@Schema({ _id: true, timestamps: true })
export class AttachedCv {
    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export const AttachedCvSchema = SchemaFactory.createForClass(AttachedCv);

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
    @Prop()
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop()
    age: number;
    @Prop()
    gender: string;
    @Prop()
    address: string;
    @Prop()
    phone?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
    company?: Company | mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
    role: Role | mongoose.Schema.Types.ObjectId;

    @Prop({ select: false })
    refreshToken?: string;

    @Prop({ type: Object })
    createdBy?: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }
    @Prop({ type: Object, select: false })
    updatedBy?: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }
    @Prop({ type: Object, select: false })
    deletedBy?: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }
    @Prop({ select: false })
    createdAt?: Date;
    @Prop({ select: false })
    updatedAt?: Date;
    @Prop({ default: false, select: false })
    isDeleted?: boolean;
    @Prop({ select: false })
    deletedAt?: Date;

    @Prop()
    aboutMe?: string;

    @Prop()
    cvUrl?: string; // Added cvUrl property

    @Prop({ type: [AttachedCvSchema], default: [] })
    attachedCvs?: AttachedCv[];

    @Prop({ type: [EducationSchema] })
    education?: Education[];

    @Prop({ type: [ExperienceSchema] })
    experience?: Experience[];

    @Prop({ type: [String] })
    skills?: string[];

    @Prop({ type: [ProjectSchema] })
    projects?: Project[];

    @Prop({ type: [CertificateSchema] })
    certificates?: Certificate[];

    @Prop({ type: [AwardSchema] })
    awards?: Award[];
}
export const UserSchema = SchemaFactory.createForClass(User);
