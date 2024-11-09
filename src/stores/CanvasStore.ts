import { observable } from "@legendapp/state";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
interface CanvasStore {
  edits: CanvasItem[];
  curCanvas: Canvas | null;
}
const { width, height } = Dimensions.get("window");
export const defaultCanvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [],
  screenWidth: width,
  screenHeight: height,
  curId: 0,
  maxZIndex: 0,
};
export const canvasStore$ = observable<CanvasStore>({
  curCanvas: defaultCanvas,
  edits: [],
});
