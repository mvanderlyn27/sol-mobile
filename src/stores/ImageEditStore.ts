import { observable } from "@legendapp/state";
import { canvasStore$ } from "./CanvasStore";
import { CanvasImage, NotificationType } from "../types/shared.types";
import { imagesItems$ } from "./PagesStore";
import { images$ } from "./ImageStore";
import { add } from "lodash";
import { addNotification } from "./NotificationStore";
import { generateId } from "./AsyncStorage";
interface ImageEditStore {
  id: string;
  selectedImage: string | null;
  editImage: (id: string) => void;
}
export const imageEditStore$ = observable<ImageEditStore>({
  id: "",
  selectedImage: null,
  editImage: (id: string) => {
    const item$ = imagesItems$[id];
    const path = images$[item$.image_id.get()].path.get();
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
