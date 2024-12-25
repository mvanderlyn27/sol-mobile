import { observable } from "@legendapp/state";
import { CanvasImage, NotificationType } from "../types/shared.types";
import { images$ } from "./ImageStore";
import { add } from "lodash";
import { addNotification } from "./NotificationStore";
import { generateId } from "./AsyncStorage";
import { getCanvasItemIndex } from "../services/Page";
import { canvasStore$ } from "./PagesStore";
interface ImageEditStore {
  id: string;
  selectedImage: string | null;
  editImage: (id: string) => void;
}
export const imageEditStore$ = observable<ImageEditStore>({
  id: "",
  selectedImage: null,
  editImage: (id: string) => {
    const items = canvasStore$.canvas.items.get();
    if (!items) {
      console.log("can't find items");
      addNotification({
        id: generateId(),
        type: NotificationType.error,
        message: "Error finding image",
      });
      return;
    }
    const item = items[getCanvasItemIndex(id)];
    if (!item || item.type === "text") {
      console.log("can't find image to edit");
      addNotification({
        id: generateId(),
        type: NotificationType.error,
        message: "Image not found",
      });
      return;
    }
    console.log("item", item);
    const path = item.path;
    if (!path) {
      addNotification({
        id: generateId(),
        type: NotificationType.error,
        message: "Image not found",
      });
      console.log("can't find image to edit");
      return;
    }
    imageEditStore$.id.set(id);
    imageEditStore$.selectedImage.set(path);
  },
});
