import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserModel {
  @Prop({ unique: true, required: true }) username: string;
  @Prop({ unique: true, required: true }) email: string;
  @Prop({ required: true }) password: string;
}

export type UserDocument = UserModel & Document;
export const UserSchema = SchemaFactory.createForClass(UserModel);
