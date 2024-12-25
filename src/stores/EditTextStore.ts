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
export const textStore$ = observable({
  id: "",
  size: 30,
  scale: 1,
  color: "#000",
  font: "Calibri",
  text: "",
  reset: () => {
    textStore$.id.set("");
    textStore$.size.set(30);
    textStore$.color.set("#000");
    textStore$.font.set("Calibri");
    textStore$.text.set("");
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
    textStore$.size.set(textItem.fontSize || 30);
    textStore$.color.set(textItem.fontColor || "#ffffff");
    textStore$.font.set(textItem.fontType || "Calibri");
    textStore$.text.set(textItem.textContent || "");
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
    textStore$.size.set(curTextItem.fontSize || 30);
    textStore$.color.set(curTextItem.fontColor || "#ffffff");
    textStore$.font.set(curTextItem.fontType || "Calibri");
    textStore$.text.set(curTextItem.textContent || "");
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayReactOverlay.set(true);
  },
});
