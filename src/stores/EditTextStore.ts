import { observable } from "@legendapp/state";
import { canvasStore$ } from "./CanvasStore";
import { CanvasReaction, CanvasText } from "../types/shared.types";
import { uiStore$ } from "./UIStore";
import { editReactStore$, reactStore$, reactions$ } from "./ReactStore";
import { jsonToReact } from "../services/Reaction";
import { textItems$ } from "./PagesStore";
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
  color: "#ffffff",
  font: "Calibri",
  text: "",
  reset: () => {
    textStore$.id.set("");
    textStore$.size.set(30);
    textStore$.color.set("#ffffff");
    textStore$.font.set("Calibri");
    textStore$.text.set("");
  },
  editText: (id: string) => {
    const textItem = textItems$[id];
    textStore$.id.set(id);
    textStore$.size.set(textItem.font_size.get() || 30);
    textStore$.color.set(textItem.color.get() || "#ffffff");
    textStore$.font.set(textItem.font.get() || "Calibri");
    textStore$.text.set(textItem.text.get() || "");
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayTextOverlay.set(true);
  },
  //   editReact: (id: string) => {
  //     let items = editReactStore$.userReactions.get();

  //     // Find the index of the item by ID
  //     const itemIndex = items?.findIndex((i) => i.id === id);
  //     if (itemIndex === -1 || itemIndex === undefined) return; // If item not found, exit

  //     const curItem: ReactionItem = items[itemIndex];

  //     textStore$.id.set(id);
  //     textStore$.size.set(curItem.fontSize);
  //     textStore$.color.set(curItem.fontColor);
  //     textStore$.font.set(curItem.font);
  //     textStore$.text.set(curItem.textContent);
  //     uiStore$.displayCanvasMenu.set(false);
  //     uiStore$.displayReactOverlay.set(true);
  //   },
});
