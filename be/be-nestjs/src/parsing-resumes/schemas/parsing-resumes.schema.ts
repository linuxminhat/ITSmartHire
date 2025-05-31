import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResumeParsedDocument = ResumeParsed & Document;

@Schema({ timestamps: true })
export class ResumeParsed {
    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    university: string;

    @Prop({ type: String })
    github: string;

    @Prop({ type: [String], default: [] })
    skills: string[];

    @Prop({ type: String, required: false })
    email?: string;

    @Prop({ type: [String], default: [] })
    certifications?: string[];
}

export const ParsingResumesSchema = SchemaFactory.createForClass(ResumeParsed);
