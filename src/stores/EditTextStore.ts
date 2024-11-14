import { observable } from "@legendapp/state";
import { canvasStore$ } from "./CanvasStore";
import { CanvasText } from "../types/shared.types";
import { uiStore$ } from "./UIStore";
import { reactStore$, reactions$ } from "./ReactStore";
import { jsonToReact } from "../services/Reaction";
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
  fontIndex: 0,
  text: "Text",
  reset: () => {
    textStore$.id.set("");
    textStore$.size.set(20);
    textStore$.color.set("#ffffff");
    textStore$.fontIndex.set(0);
    textStore$.text.set("Text");
  },
  editText: (id: string) => {
    let items = canvasStore$.curCanvas.items.get();

    // Find the index of the item by ID
    const itemIndex = items?.findIndex((i) => i.id === id);
    if (itemIndex === -1 || itemIndex === undefined) return; // If item not found, exit
    const curItem = canvasStore$.curCanvas.items[itemIndex].get() as CanvasText;
    textStore$.id.set(id);
    textStore$.size.set(curItem.fontSize);
    textStore$.color.set(curItem.fontColor);
    const index = fonts.indexOf(curItem.fontType);
    textStore$.fontIndex.set(index);
    textStore$.text.set(curItem.textContent);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayTextOverlay.set(true);
  },
  editReact: (id: string) => {
    let items = canvasStore$.curCanvas.items.get();

    // Find the index of the item by ID
    const itemIndex = items?.findIndex((i) => i.id === id);
    if (itemIndex === -1 || itemIndex === undefined) return; // If item not found, exit

    const reaction = reactions$[id].get();
    const curItem = jsonToReact(reaction.reaction);
    if (!curItem) {
      console.log("issue getting reaction");
      return null;
    }
    textStore$.id.set(id);
    textStore$.size.set(curItem.fontSize);
    textStore$.color.set(curItem.fontColor);
    const index = fonts.indexOf(curItem.fontType);
    textStore$.fontIndex.set(index);
    textStore$.text.set(curItem.textContent);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayReactOverlay.set(true);
  },
});
