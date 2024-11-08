import { observable } from "@legendapp/state";
import { Canvas, CanvasItem } from "../types/shared.types";
interface CanvasStore {
  edits: CanvasItem[];
  curCanvas: Canvas | null;
}
export const canvasStore$ = observable<CanvasStore>({
  curCanvas: null,
  edits: [],
});
