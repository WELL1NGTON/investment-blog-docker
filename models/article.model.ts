import mongoose, { Schema, Document } from "mongoose";
import mongoose_fuzzy_search from "../typings/mongoose_fuzzy_search";
import slugify from "slugify";
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");
// import Category from "../models/category.model";

export interface IArticle extends Document {
  title: string;
  description: string;
  markdownArticle: string;
  date: Date;
  tags: Array<string>;
  author: string;
  previewImg: string;
  images: Array<string>;
  visibility: string;
  state: string;
  slug: string;
}

const ArticleSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: { type: String, default: "" },
    markdownArticle: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    author: { type: String, required: true },
    previewImg: { type: String, default: "" },
    images: { type: [String], default: [] },
    visibility: {
      type: String,
      enum: ["ALL", "EDITORS", "USERS"],
      default: "ALL",
      required: true,
    },
    state: {
      type: String,
      enum: ["EDITING", "PUBLISHED", "DELETED"],
      default: "EDITING",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

ArticleSchema.plugin(mongoose_fuzzy_searching, {
  fields: [
    { name: "title", weight: 3 },
    { name: "description", weight: 2 },
    { name: "markdownArticle", weight: 1 },
  ],
});

ArticleSchema.pre<IArticle>("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
    this.tags = this.tags.map((tag: string) => tag.toUpperCase());
  }

  next();
});

// ArticleSchema.post<IArticle>("save", function (doc) {
//   if (doc.tags.length > 0) {
//     doc.tags.forEach((tag) => {
//       Category.findOneAndUpdate(
//         { name: tag },
//         { $inc: { posts_count: 1 } },
//         { upsert: true, new: true, setDefaultsOnInsert: true }
//       )
//         .exec()
//         .catch((err) => console.log("Error: " + err));
//     });
//   }
// });

// ArticleSchema.post<IArticle>("remove", function (doc) {
//   if (doc.tags.length > 0) {
//     doc.tags.forEach((tag) => {
//       Category.findOneAndUpdate(
//         { name: tag },
//         { $inc: { posts_count: -1 } },
//         { upsert: true, new: true, setDefaultsOnInsert: true }
//       )
//         .exec()
//         .catch((err) => console.log("Error: " + err));
//     });
//   }
// });

// ArticleSchema.post<IArticle>("remove", function (doc) {
//   if (doc.tags.length > 0) {
//     doc.tags.forEach((tag) => {
//       Category.findOneAndUpdate(
//         { name: tag },
//         { $inc: { posts_count: -1 } },
//         { upsert: true, new: true, setDefaultsOnInsert: true }
//       )
//         .exec()
//         .catch((err) => console.log("Error: " + err));
//     });
//   }
// });

export default mongoose.model<IArticle>(
  "Article",
  ArticleSchema
) as mongoose_fuzzy_search.MongooseFuzzyModel<IArticle>;
