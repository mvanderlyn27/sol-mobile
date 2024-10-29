// model/Page.ts
import { Canvas } from "@/src/types/shared.types";
import { Model } from "@nozbe/watermelondb";
import { date, readonly, text, json } from "@nozbe/watermelondb/decorators";

// JSON field parser for the canvas, ensuring a valid Canvas type or null
const sanitizeCanvas = (json: string) => json;

export default class Page extends Model {
  static table = "pages";

  static associations = {
    book: { type: "belongs_to", key: "book_id" } as const,
  };

  // Fields
  @text("date") date!: string;
  @json("canvas", sanitizeCanvas) canvas!: Canvas;
  @text("book_id") bookId!: string;

  // Readonly fields
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;
}
