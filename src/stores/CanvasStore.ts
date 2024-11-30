import { mergeIntoObservable, observable } from "@legendapp/state";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
import { generateId } from "./AsyncStorage";
import { Image } from "../types/shared.types";
import { backgroundImages$, images$ } from "./ImageStore";

interface CanvasStore {
  edits: CanvasItem[];
  pageId: string;
  backgroundImage: Image;
  items: CanvasItem[];
  screenWidth: number;
  screenHeight: number;
  maxZIndex?: number;
}

const { width, height } = Dimensions.get("window");

const defaultImage: Image = {
  path: "bg_04",
  type: ImageType.Local,
} as Image;

// Observable store
export const canvasStore$ = observable<CanvasStore>({
  // curCanvas: { ...defaultCanvas },
  backgroundImage: defaultImage,
  pageId: "",
  items: [],
  edits: [],
  screenWidth: width,
  screenHeight: height,
  maxZIndex: undefined,
});
// Add a new item to the canvas
export const addCanvasItem = (item: CanvasItem) => {
  console.log("before", canvasStore$.items.get());
  canvasStore$.items.push(item);
  console.log("after", canvasStore$.items.get());
};

// Update an existing item on the canvas
export const updateCanvasItem = (id: string, item: CanvasItem) => {
  const index = canvasStore$.items.findIndex((canvasItem) => canvasItem.id.get() === id);
  canvasStore$.items[index].set(item);
};

// Clear the canvas to its default state
export const clearCanvas = () => {
  canvasStore$.items.set([]);
};

// Remove an item from the canvas by its ID
export const removeCanvasItem = (id: string) => {
  canvasStore$.items.filter((canvasItem) => canvasItem.id.get() !== id);
};
