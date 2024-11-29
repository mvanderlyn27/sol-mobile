import { Database } from "./supabase.types";
export type Json = Record<string, any>;

//Supabase Types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Page = Database["public"]["Tables"]["pages_test"]["Row"];
export type PageItem = Database["public"]["Tables"]["page_items"]["Row"];
export type ImageItem = Database["public"]["Tables"]["image_items"]["Row"];
export type TextItem = Database["public"]["Tables"]["text_items"]["Row"];
export type Image = Database["public"]["Tables"]["images"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Font = Database["public"]["Tables"]["fonts"]["Row"];
export type Sticker = Database["public"]["Tables"]["stickers"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type Frame = Database["public"]["Tables"]["frames"]["Row"];

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
  Background = "background",
  Image = "image",
  Font = "font",
  Sticker = "sticker",
  View = "view",
  React = "react",
  Trash = "trash",
  Add = "add",
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
  Background = "background",
  Image = "image",
  Text = "Text",
  Sticker = "sticker",
}
export enum BottomDrawerType {
  Destructive = "destructive",
  Save = "save",
}
export interface CanvasItemBase {
  //database id of item used eg font id, or frame id
  id: string;
  // dbId: string;
  //pixel count
  x: number;
  //pixel count
  y: number;
  // z index, default to 0
  z: number;
  //rad
  rotation: number;
  //calc when adding to screen to ensure it fits in the frame properly, increase/decrease as desiread
  width: number;
  height: number;
  //original picture width/height, doesn't change
}
export interface CanvasFrame extends CanvasItemBase {
  type: "frame";
  path: string; // Path to the frame image
  width: number;
  height: number;
  slots: CanvasFrameSlot[]; // Array of slots for images
}
export interface CanvasImage extends CanvasItemBase {
  type: "image";
  path: string; // Path to the frame image
  placeholder?: string;
  width: number;
  height: number;
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
export interface CanvasReaction extends CanvasItemBase {
  type: "reaction";
  textContent: string; // The text content to be displayed
  fontSize: number; // Size of the text font
  fontColor: string; // Color of the text
  fontType: string;
}
export type CanvasItem = CanvasFrame | CanvasText | CanvasImage;

export interface Canvas {
  id: string;
  backgroundImage: Image; // Path to the background image
  items: CanvasItem[]; // Array of canvas items};
  //screen size canvas was last saved with
  screenWidth: number;
  screenHeight: number;
  maxZIndex: number;
}
//Book Types
//Font Types
export type CreateFontInput = {
  fontImage: Image;
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
// export type Image = {
//   path: string;
//   type: ImageType;
// };
export enum ImageType {
  Web = "web",
  Local = "local",
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
  mimeType: string;
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

//Quick Actions
export type QuickActionInfo = {
  icon: string;
  label: string;
  onPress: () => void;
};

// export type Group = {
//   id: string;
//   name: string;
//   coverUrl: string;
//   groupMembers: Member[];
// };

// export type Member = {
//   avatar_url: string;
//   id: string;
//   name: string;
//   group_id: string;
// };
export enum IconType {
  Instagram = "instagram",
  Facebook = "facebook",
  Tiktok = "tiktok",
  Twitter = "twitter",
}

export enum NotificationType {
  error = "error",
  success = "success",
  info = "info",
}

export type LocalNotification = {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
  // timestamp: number;
};
