import { batch, observable } from "@legendapp/state";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
import { generateId } from "./AsyncStorage";

interface CanvasStore {
  edits: CanvasItem[];
  curCanvas: Canvas | null;
}

const { width, height } = Dimensions.get("window");

export const defaultCanvas: Canvas = {
  id: generateId(),
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [],
  screenWidth: width,
  screenHeight: height,
  maxZIndex: 0,
};

// Observable store
export const canvasStore$ = observable<CanvasStore>({
  curCanvas: { ...defaultCanvas },
  edits: [],
});
// Add a new item to the canvas
export const addCanvasItem = (item: CanvasItem) => {
  const items = canvasStore$.curCanvas.items.get() || [];
  const newItems = [...items, item];
  canvasStore$.curCanvas.items.set(newItems);
  const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
  canvasStore$.curCanvas.maxZIndex.set(newZ);
};

// Update an existing item on the canvas
export const updateCanvasItem = (id: string, item: CanvasItem) => {
  const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
  const newItems = canvasStore$.curCanvas.items
    .get()
    ?.map((canvasItem) => (canvasItem.id === id ? { ...canvasItem, ...item, z: newZ } : canvasItem));
  canvasStore$.curCanvas.items.set(newItems);
  canvasStore$.curCanvas.maxZIndex.set(newZ);
};

// Clear the canvas to its default state
export const clearCanvas = () => {
  canvasStore$.curCanvas.set({ ...defaultCanvas });
};

// Remove an item from the canvas by its ID
export const removeCanvasItem = (id: string) => {
  canvasStore$.curCanvas.items.set((items) => items?.filter((canvasItem) => canvasItem.id !== id));
};
