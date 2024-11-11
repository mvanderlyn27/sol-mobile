import { batch, observable } from "@legendapp/state";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";

interface CanvasStore {
  edits: CanvasItem[];
  curCanvas: Canvas | null;
}

const { width, height } = Dimensions.get("window");

export const defaultCanvas: Canvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [],
  screenWidth: width,
  screenHeight: height,
  curId: 0,
  maxZIndex: 0,
};

// Observable store
export const canvasStore$ = observable<CanvasStore>({
  curCanvas: defaultCanvas,
  edits: [],
});
// Add a new item to the canvas
export const addCanvasItem = (item: CanvasItem) => {
  batch(() => {
    const items = canvasStore$.curCanvas.items.get() || [];
    canvasStore$.curCanvas.items.set([...items, item]);
    const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
    canvasStore$.curCanvas.maxZIndex.set(newZ);
  });
};

// Update an existing item on the canvas
export const updateCanvasItem = (id: string, item: CanvasItem) => {
  canvasStore$.curCanvas.items.set((items) =>
    items?.map((canvasItem) => (canvasItem.id === id ? { ...canvasItem, ...item } : canvasItem))
  );
};

// Clear the canvas to its default state
export const clearCanvas = () => {
  canvasStore$.curCanvas.set(defaultCanvas);
};

// Remove an item from the canvas by its ID
export const removeCanvasItem = (id: string) => {
  canvasStore$.curCanvas.items.set((items) => items?.filter((canvasItem) => canvasItem.id !== id));
};
