import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SkillDocument = HydratedDocument<Skill>;

@Schema({ timestamps: true })
export class Skill {
    @Prop({ required: true, unique: true }) // Ensure name is required and unique
    name: string;
    @Prop({ required: true, enum: ['Java Programming', 'DevOps', 'Frontend', 'Database', /* … */] })
    category: string;
    @Prop({ default: '' })
    description: string;
    @Prop({ default: true })
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
export const SkillSchema = SchemaFactory.createForClass(Skill); 