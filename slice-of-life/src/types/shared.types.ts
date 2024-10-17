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
  Menu = "menu",
  Library = "library",
  JournalCheck = "journal-check",
  JournalEdit = "journal-edit",
  Profile = "profile",
  Edit = "edit",
  Share = "share",
  X = "x",
  Save = "save",
  Text = "text",
  Frame = "frame",
  Template = "template",
  Settings = "settings",
  Tutorial = "tutorial",
}
//Vertical Stack Types
export type VerticalStackItem = {
  onClick: () => void;
  primary?: boolean;
  selected?: boolean;
  buttonType: ButtonType;
  disabled?: boolean;
};
//Canvas Types
export enum BottomBarTab {
  Template = "template",
  Frame = "frame",
  Font = "font",
}
export enum BottomDrawerType {
  Destructive = "destructive",
  Save = "save",
}
export interface CanvasItemBase {
  //database id of item used eg font id, or frame id
  id: number;
  dbId: number;
  //pixel count
  x: number;
  //pixel count
  y: number;
  // z index, default to 0
  z: number;
  //rad
  rotation: number;
  //calc when adding to screen to ensure it fits in the frame properly, increase/decrease as desiread
  scale: number;

  //original picture width/height, doesn't change
}
export interface CanvasFrame extends CanvasItemBase {
  type: "frame";
  path: string; // Path to the frame image
  width: number;
  height: number;
  slots: CanvasFrameSlot[]; // Array of slots for images
}
export interface CanvasFrameSlot {
  // id: number; // Unique identifier for the slot
  // x: number; // X position of the slot within the frame
  // y: number; // Y position of the slot within the frame
  // width: number; // Width of the slot
  // height: number; // Height of the slot
  //currently 1 mask same size/width/height/scale as parent
  maskPath: string;
  image?: CanvasFrameSlotImage; // Optional URL for the image that fits in the slot
}
export interface CanvasFrameSlotImage {
  url: string; // URL of the image that fits in the slot
  width?: number; // image original width
  height?: number; //original height
  //used to scale image via gesture
  scale?: number;
  // used to rotate image in frame
  rotation?: number;
  //need someway to ensure its not dragged off the screen lol
  //relative to parent
  x?: number;
  y?: number;
}

export interface CanvasText extends CanvasItemBase {
  type: "text";
  textContent: string; // The text content to be displayed
  fontSize: number; // Size of the text font
  fontColor: string; // Color of the text
  fontType: string;
}
export type CanvasItem = CanvasFrame | CanvasText;

export type Canvas = {
  backgroundImage: CanvasImage; // Path to the background image
  items: CanvasItem[]; // Array of canvas items};
  //screen size canvas was last saved with
  screenWidth: number;
  screenHeight: number;
  curId: number;
  maxZIndex: number;
};
//Book Types
export type CreateBookInput = {
  type: BookType;
};

//Font Types
export type CreateFontInput = {
  fontImage: CanvasImage;
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
  //book id to save page to
  book: number;
  canvas: Json;
  date: string;
  last_edited: string;
};
export type CanvasImage = {
  path: string;
  type: ImageType;
};
export enum ImageType {
  Web = "Web",
  Local = "Local",
}
//Profile Types
export type CreateProfileInput = {
  avatar_url: string;
  name: string;
  new: boolean;
};
export type UpdateProfileInput = {
  //   file?: File | Blob;
  file?: FileUploadInput;
  name?: string;
  new?: boolean;
};
export type FileUploadInput = {
  bucket: string;
  filePath: string;
  base64: string;
  fileExtension: string;
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
