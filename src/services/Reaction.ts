import { Canvas, CanvasReaction, Reaction } from "../types/shared.types";
import { Json } from "../types/supabase.types";

export const jsonToReactOld = (json: Json): CanvasReaction | null => {
  try {
    return JSON.parse(json as string) as CanvasReaction;
  } catch (error) {
    console.warn("Error converting JSON to Canvas:", error);
    return null;
  }
};

export const jsonToReact = (json: Json): CanvasReaction | null => {
  try {
    // If it's already an object, return it directly
    if (typeof json === "object" && json !== null) {
      return json as unknown as CanvasReaction; // Assume it's already a valid Canvas object
    }

    // If it's a string, parse it into an object
    if (typeof json === "string") {
      return JSON.parse(json) as CanvasReaction;
    }

    // If it's neither an object nor a string, log a warning
    console.warn("Invalid JSON type:", typeof json, json);
    return null;
  } catch (error) {
    console.warn("Error converting JSON to Canvas:", error);
    return null;
  }
};

export const reactToJsonOld = (react: CanvasReaction): Json | null => {
  try {
    return JSON.stringify(react);
  } catch (error) {
    console.warn("Error converting JSON to Canvas:", error);
    return null;
  }
};
