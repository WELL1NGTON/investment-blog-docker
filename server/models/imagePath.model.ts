import mongoose, { Schema, Document } from "mongoose";

export interface IImagePath extends Document {
  name: string;
  path: string;
  url: string;
  articles: Array<string>;
  tags: Array<string>;
  user: string;
}

const ImagePathSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    path: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    articles: { type: [String], required: true },
    tags: { type: [String], required: true },
    user: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IImagePath>("ImagePath", ImagePathSchema);
