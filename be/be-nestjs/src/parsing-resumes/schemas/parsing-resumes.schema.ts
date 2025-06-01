import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ResumeParsed {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    phone: string;

    @Prop({ type: String })
    github: string;

    @Prop({ type: String })
    location: string;

    @Prop({ type: String })
    university: string;

    @Prop({ type: String })
    degree: string;

    @Prop({ type: String })
    gpa: string;

    @Prop({
        type: [{
            company: String,
            position: String,
            duration: String,
            description: [String]
        }]
    })
    workExperiences: Array<{
        company: string;
        position: string;
        duration: string;
        description: string[];
    }>;

    @Prop({
        type: [{
            name: String,
            description: [String]
        }]
    })
    projects: Array<{
        name: string;
        description: string[];
    }>;

    @Prop({ type: [String] })
    skills: string[];

    @Prop({ type: [String] })
    certifications: string[];
}

export const ParsingResumesSchema = SchemaFactory.createForClass(ResumeParsed);