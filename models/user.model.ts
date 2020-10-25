import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  password: string;
  role: string;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      unique: true,
    },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    resetPasswordToken: { type: String, required: false, unique: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
