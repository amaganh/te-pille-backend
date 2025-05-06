import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  pwd: string;
}

const userSchema = new Schema<User>({
  username: { type: String, unique: true, required: true },
  pwd: { type: String, required: true },
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
