import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  user_id: string;
  token: string;
}

const RefreshTokenSchema: Schema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    token: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema
);
