import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

// Define and Export the structure for the attached CV subdocument
@Schema({ timestamps: true, versionKey: false, _id: true })
export class AttachedCv { // Renamed from Resume
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  createdAt?: Date;
  updatedAt?: Date;
}
export const AttachedCvSchema = SchemaFactory.createForClass(AttachedCv); // Renamed schema export

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
  
  // Add the attachedCvs array field using the AttachedCv sub-schema
  @Prop({ type: [AttachedCvSchema], default: [] }) // Renamed field and schema type
  attachedCvs?: AttachedCv[]; // Renamed field

  // Add fields for other profile sections here later
  // e.g., @Prop({ type: [EducationSchema] }) education?: Education[];
  // e.g., @Prop({ type: [ExperienceSchema] }) experience?: Experience[];

}

export const UserSchema = SchemaFactory.createForClass(User);

// Define Sub-Schemas for nested arrays if needed (example)
// @Schema({ _id: false }) // Disable automatic _id for sub-docs if not needed
// export class Education {
//   @Prop() school: string;
//   @Prop() degree: string;
//   @Prop() fieldOfStudy: string;
//   @Prop() startDate: Date;
//   @Prop() endDate: Date;
//   @Prop() description?: string;
// }
// export const EducationSchema = SchemaFactory.createForClass(Education); 