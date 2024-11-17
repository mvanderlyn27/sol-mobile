import { Canvas } from "../types/shared.types";
import { Json } from "../types/supabase.types";

export const jsonToCanvas = (json: Json): Canvas | null => {
  try {
    // If it's already an object, return it directly
    if (typeof json === "object" && json !== null) {
      return json as unknown as Canvas; // Assume it's already a valid Canvas object
    }

    // If it's a string, parse it into an object
    if (typeof json === "string") {
      return JSON.parse(json) as Canvas;
    }

    // If it's neither an object nor a string, log a warning
    console.warn("Invalid JSON type:", typeof json, json);
    return null;
  } catch (error) {
    console.warn("Error converting JSON to Canvas:", error);
    return null;
  }
};
