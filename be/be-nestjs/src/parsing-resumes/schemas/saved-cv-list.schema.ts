import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

interface WorkExperience {
    company: string;
    position: string;
    duration: string;
    description: string[];
}

interface Project {
    name: string;
    description: string[];
}

// Interface for parsed CV
interface ParsedResumeData {
    name: string;
    email: string;
    phone: string;
    github: string;
    location: string;
    university: string;
    degree: string;
    gpa: string;
    workExperiences: WorkExperience[];
    projects: Project[];
    skills: string[];
    certifications: string[];
}

@Schema({ timestamps: true })
export class SavedCVList extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({
        required: true,
        enum: ['csv', 'excel'],
        type: String
    })
    format: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    hrId: string;

    @Prop({
        type: [{
            name: String,
            email: String,
            phone: String,
            github: String,
            location: String,
            university: String,
            degree: String,
            gpa: String,
            workExperiences: [{
                company: String,
                position: String,
                duration: String,
                description: [String]
            }],
            projects: [{
                name: String,
                description: [String]
            }],
            skills: [String],
            certifications: [String]
        }],
        required: true
    })
    cvs: any[];
}

export const SavedCVListSchema = SchemaFactory.createForClass(SavedCVList);
