import { observable } from "@legendapp/state";
import { supabase } from "../lib/supabase";
import { CanvasImage, CanvasItem, Image } from "../types/shared.types";
import { customSupabaseSynced, generateId } from "./AsyncStorage";

export const images$ = observable<Record<string, Image>>(
  customSupabaseSynced({
    supabase,
    collection: "images",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: "images",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);

export const backgroundImages$ = Object.values(images$).filter((image) => image.type.get() === "background");
