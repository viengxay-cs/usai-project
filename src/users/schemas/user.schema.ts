import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  WORKER = 'WORKER',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  phone!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Prop()
  avatarUrl?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);