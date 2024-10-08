import { Database, Json } from "./supabase.types";

//Supabase Types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Page = Database["public"]["Tables"]["pages"]["Row"];
export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Font = Database["public"]["Tables"]["fonts"]["Row"];
export type Sticker = Database["public"]["Tables"]["stickers"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type Frame = Database["public"]["Tables"]["frames"]["Row"];
export type BookType = Database["public"]["Enums"]["book_type"];

//Button Types
export enum ButtonType {
  Menu,
  Library,
  Journal,
  Profile,
  Edit,
  Share,
}

//Canvas Types

interface CanvasItemBase {
  id: string;
  xPercent: number;
  yPercent: number;
  rotation: number;
  widthPercent: number;
  aspectRatio: number;
}
interface CanvasFrame extends CanvasItemBase {
  type: "frame";
  imagePath: string; // Path to the frame image
}

interface CanvasText extends CanvasItemBase {
  type: "text";
  textContent: string; // The text content to be displayed
  fontSize: number; // Size of the text font
  fontColor: string; // Color of the text
}
export type CanvasItem = CanvasFrame | CanvasText;

export type Canvas = {
  backgroundImagePath: string; // Path to the background image
  items: CanvasItem[]; // Array of canvas items};
};
//Book Types
export type CreateBookInput = {
  type: BookType;
};

//Font Types
export type CreateFontInput = {
  fontImage: string;
  name: string;
  type: string;
};

//Frame Types
export type CreateFrameInput = {
  path: string;
  name: string;
  aspect_ratio: number;
};

// Page types
export type CreatePageInput = {
  book: number;
  canvas: Json;
  date: string;
  last_edited: string;
};

//Profile Types
export type CreateProfileInput = {
  avatar_url: string;
  name: string;
  new: boolean;
};
export type UpdateProfileInput = {
  //   file?: File | Blob;
  file?: File;
  name: string;
};

// Sticker Types
export type CreateStickerInput = {
  path: string;
  name: string;
};

//Template Types
export type CreateTemplateInput = {
  path: string;
  name: string;
  data: Json;
};
