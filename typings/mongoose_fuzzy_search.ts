import {
  Document,
  DocumentQuery,
  Model,
  Schema,
  MongooseFilterQuery,
  FilterQuery,
} from "mongoose";
import { IArticle } from "../models/article.model";

declare module mongoose_fuzzy_search {
  export interface MongooseFuzzyOptions<T> {
    fields: (T extends Object ? keyof T : string)[];
  }

  export interface MongooseFuzzyModel<T extends Document, QueryHelpers = {}>
    extends Model<T, QueryHelpers> {
    fuzzySearch(
      search: String,
      callBack?: (err: any, data: Model<T, QueryHelpers>[]) => void
    ): DocumentQuery<T[], T, QueryHelpers>;
    fuzzySearch(
      search: String,
      // criteria: MongooseFilterQuery<T>
      // criteria: any
      criteria: FilterQuery<T>
    ): DocumentQuery<T[], T, QueryHelpers>;
  }

  export function fuzzyPlugin<T>(
    schema: Schema<T>,
    options: MongooseFuzzyOptions<T>
  ): void;
}

export default mongoose_fuzzy_search;
