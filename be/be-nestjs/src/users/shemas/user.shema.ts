import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongooseDelete from 'soft-delete-plugin-mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop()
    email: string;
    @Prop()
    password: string;
    @Prop()
    name: string;
    @Prop()
    age: number;
    @Prop()
    address: string;
    @Prop()
    createdAt: Date;
    @Prop()
    updatedAt: Date;
    @Prop()
    isDeleted: boolean;
    @Prop()
    deletedAt: Date;

}
export const UserSchema = SchemaFactory.createForClass(User);
