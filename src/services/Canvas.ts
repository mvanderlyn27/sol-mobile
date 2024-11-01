import { Canvas } from "../types/shared.types";
import { Json } from "../types/supabase.types";

export const jsonToCanvas = (json: string): Canvas | null => {
  try {
    const canvasObject: Canvas = JSON.parse(json);
    return canvasObject;
  } catch (error) {
    console.error("Error converting JSON to Canvas:", error);
    return null;
  }
};
