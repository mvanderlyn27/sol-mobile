import { observable } from "@legendapp/state";
import { supabase } from "../lib/supabase";
import { Image } from "../types/shared.types";
import { customSupabaseSynced } from "./AsyncStorage";
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
