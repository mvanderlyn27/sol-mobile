import { observable } from "@legendapp/state";
import { uiStore$ } from "./UIStore";
import { reactionTextItems$ } from "./ReactStore";
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
    const textItem = textItems$[id];
    textStore$.id.set(id);
    textStore$.size.set(textItem.font_size.get() || 30);
    textStore$.color.set(textItem.color.get() || "#ffffff");
    textStore$.font.set(textItem.font.get() || "Calibri");
    textStore$.text.set(textItem.text.get() || "");
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayTextOverlay.set(true);
  },
  editTextReact: (id: string) => {
    // Find the index of the item by ID
    const curTextItem = reactionTextItems$[id].get();
    textStore$.id.set(id);
    textStore$.size.set(curTextItem.font_size);
    textStore$.color.set(curTextItem.color);
    textStore$.font.set(curTextItem.font);
    textStore$.text.set(curTextItem.text);
    uiStore$.displayCanvasMenu.set(false);
    uiStore$.displayReactOverlay.set(true);
  },
});
