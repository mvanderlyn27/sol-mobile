import { observable } from "@legendapp/state";
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
  size: 20,
  color: "#ffffff",
  fontIndex: 0,
  text: "Text",
});
