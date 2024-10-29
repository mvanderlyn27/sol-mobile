// model/Post.js
import { BookType } from "@/src/types/shared.types";
import { Model } from "@nozbe/watermelondb";
import { date, readonly } from "@nozbe/watermelondb/decorators";
import { field } from "@nozbe/watermelondb/decorators";

export default class Book extends Model {
  static table = "books";
  static associations = {
    pages: { type: "has_many", foreignKey: "id" } as const,
  };
  @field("type") type!: string;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}
