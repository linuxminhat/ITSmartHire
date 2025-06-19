import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false, _id: true })
export class AttachedCv {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  createdAt?: Date;
  updatedAt?: Date;
}
export const AttachedCvSchema = SchemaFactory.createForClass(AttachedCv);

@Schema({ timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop()
  age: number;

  @Prop()
  gender: string;

  @Prop()
  address: string;

  @Prop()
  phone?: string;

  @Prop({ type: Object })
  createdBy?: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy?: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy?: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: Role;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  company?: Company;

  @Prop()
  refreshToken?: string;

  @Prop()
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  aboutMe?: string;

  @Prop({ type: [AttachedCvSchema], default: [] })
  attachedCvs?: AttachedCv[];

}

export const UserSchema = SchemaFactory.createForClass(User);