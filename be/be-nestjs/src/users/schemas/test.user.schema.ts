import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type TestUserDocument = HydratedDocument<TestUser>;
@Schema()
export class TestUser {
    @Prop()
    email: string;
    @Prop()
    password: string;
    @Prop()
    name: string;
    @Prop()
    age: number;

}
export const TestUserSchema = SchemaFactory.createForClass(TestUser);
