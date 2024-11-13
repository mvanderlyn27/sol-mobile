import { observable } from "@legendapp/state";
import { canvasStore$ } from "./CanvasStore";
import { CanvasImage } from "../types/shared.types";
interface ImageEditStore {
  id: string;
  selectedImage: string | null;
  editImage: (id: string) => void;
}
export const imageEditStore$ = observable<ImageEditStore>({
  id: "",
  selectedImage: null,
  editImage: (id: string) => {
    let items = canvasStore$.curCanvas.items.get();

    // Find the index of the item by ID
    const itemIndex = items?.findIndex((i) => i.id === id);
    console.log("curcanvas", canvasStore$.curCanvas.get());
    if (itemIndex === -1 || itemIndex === undefined) return;
    const curItem = canvasStore$.curCanvas.items[itemIndex].get() as CanvasImage;
    imageEditStore$.id.set(id);
    imageEditStore$.selectedImage.set(curItem.path);
  },
});
