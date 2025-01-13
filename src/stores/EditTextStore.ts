import { observable } from "@legendapp/state";
import { uiStore$ } from "./UIStore";
import { canvasStore$ } from "./PagesStore";
import { getCanvasItemIndex } from "../services/Page";
import { addNotification } from "./NotificationStore";
import { NotificationType } from "../types/shared.types";
import { generateId } from "./AsyncStorage";
import { reactStore$ } from "./ReactStore";
import { getCanvasReactionItemIndex } from "../services/Reaction";
export const fonts = [
  "Calibri",
  "Calibri-Bold",
  "Calibri-Light",
  "Cour",
  "Exo2-Italic",
  "Exo2",
  "Inkfree",
  "Ocra",
  "PragmaticaExtended-Bold",
  "PragmaticaExtended-Light",
  "PragmaticaExtended",
];
interface TextStore {
  id: string;
  size: number;
  color: string;
  font: string;
  text: string;
  textBackgroundColor: string | null;
  textBackground: "normal" | "inversed" | null;
  textAlign: "left" | "center" | "right";
  reset: () => void;
  editText: (id: string) => void;
  editTextReact: (id: string) => void;
}
export const textStore$ = observable<TextStore>({
  id: "",
  size: 0.05,
  color: "#000",
  font: "Calibri",
  text: "",
  textAlign: "left",
  textBackground: null,
  textBackgroundColor: null,
  reset: () => {
    textStore$.id.set("");
    textStore$.size.set(0.05);
    textStore$.color.set("#000");
    textStore$.font.set("Calibri");
    textStore$.text.set("");
    textStore$.textAlign.set("left");
    textStore$.textBackground.set(null);
    textStore$.textBackgroundColor.set(null);
  },
  editText: (id: string) => {
    // const textItem = textItems$[id];
    const textItem = canvasStore$.canvas.items[getCanvasItemIndex(id)].get();
    if (!textItem || textItem.type !== "text") {
      console.log("no text item");
      addNotification({
        id: generateId(),
        message: "No text item selected",
        type: NotificationType.error,
      });
      return;
    }
    textStore$.id.set(id);
    textStore$.size.set(textItem.fontSize || 0.1);
    textStore$.color.set(textItem.fontColor || "#ffffff");
    textStore$.font.set(textItem.fontType || "Calibri");
    textStore$.text.set(textItem.textContent || "");
    textStore$.textAlign.set(textItem.fontAlign || "left");
    textStore$.textBackground.set(textItem.fontBackground || null);
    textStore$.textBackgroundColor.set(textItem.fontBackgroundColor || null);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayTextOverlay.set(true);
  },
  editTextReact: (id: string) => {
    // Find the index of the item by ID
    const curTextItem = reactStore$.reaction.items[getCanvasReactionItemIndex(id)].get();
    if (!curTextItem || curTextItem.type !== "text") {
      console.log("no text item");
      addNotification({
        id: generateId(),
        message: "No text item selected",
        type: NotificationType.error,
      });
      return;
    }
    textStore$.id.set(id);
    textStore$.size.set(curTextItem.fontSize || 0.1);
    textStore$.color.set(curTextItem.fontColor || "#ffffff");
    textStore$.font.set(curTextItem.fontType || "Calibri");
    textStore$.text.set(curTextItem.textContent || "");
    textStore$.textBackground.set(curTextItem.fontBackground || null);
    textStore$.textBackgroundColor.set(curTextItem.fontBackgroundColor || null);
    textStore$.textAlign.set(curTextItem.fontAlign || "left");
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayReactOverlay.set(true);
  },
});
