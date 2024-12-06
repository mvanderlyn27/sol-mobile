import { observable } from "@legendapp/state";
import { supabase } from "../lib/supabase";
import { CanvasImage, CanvasItem, Image } from "../types/shared.types";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import { posthog } from "../services/Posthog";

export const images$ = observable<Record<string, Image>>(
  customSupabaseSynced({
    supabase,
    collection: "images",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: `images-${process.env.APP_VARIANT}`,
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    onError: (error: any) => {
      console.log("image error", error);
      posthog.capture("image-sync-error", { error });
    },
  })
);

export const backgroundImages = ["bg_01", "bg_02", "bg_03", "bg_04", "bg_05", "bg_09"];
