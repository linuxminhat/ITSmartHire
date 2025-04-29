import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  description: string;

  @Prop()
  thumbnail: string;

  @Prop()
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  author: mongoose.Schema.Types.ObjectId;

  @Prop([String])
  tags: string[];

  @Prop({ default: 0 })
  views: number;

  @Prop({ type: Object })
  metaData: Record<string, any>;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog); 