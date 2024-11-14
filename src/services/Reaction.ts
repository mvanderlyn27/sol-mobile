import { Canvas, CanvasReaction } from "../types/shared.types";
import { Json } from "../types/supabase.types";

export const jsonToReact = (json: Json): CanvasReaction | null => {
  try {
    return JSON.parse(json as string);
  } catch (error) {
    console.warn("Error converting JSON to Canvas:", error);
    return null;
  }
};
