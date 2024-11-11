import { batch, beginBatch, endBatch, observable } from "@legendapp/state";
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
  beginBatch();
  const items = canvasStore$.curCanvas.items.get() || [];
  canvasStore$.curCanvas.items.set([...items, item]);
  const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
  canvasStore$.curCanvas.maxZIndex.set(newZ);
  endBatch();
};

// Update an existing item on the canvas
export const updateCanvasItem = (id: string, item: CanvasItem) => {
  const newZ = (canvasStore$.curCanvas.maxZIndex.get() || 0) + 1;
  canvasStore$.curCanvas.items.set((items) =>
    items?.map((canvasItem) => (canvasItem.id === id ? { ...canvasItem, ...item, z: newZ } : canvasItem))
  );
  canvasStore$.curCanvas.maxZIndex.set(newZ);
};
export const bringToFront = (id: string) => {
  // Get the current items array from the store
  beginBatch();
  //   let items = canvasStore$.curCanvas.items.get();

  //   // Find the index of the item by ID
  //   const itemIndex = items?.findIndex((i) => i.id === id);
  //   if (itemIndex === -1 || itemIndex === undefined) return; // If item not found, exit

  //   // Remove the item from its current position
  //   const [item] = items?.splice(itemIndex, 1) || [];

  //   // Add the item to the end of the list
  //   items?.push(item);

  //   // Set the updated items list back in the store
  //   canvasStore$.curCanvas.items.set(items);
  endBatch();
};

// Clear the canvas to its default state
export const clearCanvas = () => {
  canvasStore$.curCanvas.set(defaultCanvas);
};

// Remove an item from the canvas by its ID
export const removeCanvasItem = (id: string) => {
  canvasStore$.curCanvas.items.set((items) => items?.filter((canvasItem) => canvasItem.id !== id));
};
