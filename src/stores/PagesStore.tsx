import { observable } from "@legendapp/state";
import { Canvas, GroupMember, ImageItem, Page, PageItem, TextItem, Image } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { customSupabaseSynced } from "./AsyncStorage";

import { posthog } from "../services/Posthog";
import { images$ } from "./ImageStore";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
export const pages$ = observable<Record<string, Page>>(
  customSupabaseSynced({
    supabase,
    collection: "pages",
    select: (from: any) => from.select("*"),
    realtime: true,
    actions: ["read", "create", "update", "delete"],
    persist: {
      name: `pages-${process.env.APP_VARIANT}`,
      //for some reason this is needed to make the real time syncing consistent
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<Page>) => {
      if (type === "delete") {
        Object.values(pageItems$).forEach((item) => {
          if (item.page_id.get() === value.id) {
            item.delete();
          }
        });
      }
    },
    onError: (error: any) => {
      console.log("page  error", error);
      posthog.capture("page-sync-error", { error });
    },
  })
);

export const pageItems$ = observable<Record<string, PageItem>>(
  customSupabaseSynced({
    supabase,
    collection: "page_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    actions: ["read", "create", "update", "delete"],
    persist: {
      name: `page_items-${process.env.APP_VARIANT}`,
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<PageItem>) => {
      if (type === "delete") {
        switch (value.type) {
          case "image": {
            imagesItems$[value.id].delete();
          }
          case "text": {
            textItems$[value.id].delete();
          }
        }
      } else {
        return pages$[value.page_id].created_at;
      }
    },
    onError: (error: any) => {
      console.log("page items error", error);
      posthog.capture("page-items-sync-error", { error });
    },
  })
);

export const imagesItems$ = observable<Record<string, ImageItem>>(
  customSupabaseSynced({
    supabase,
    collection: "image_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    actions: ["read", "create", "update", "delete"],
    persist: {
      name: `image_items-${process.env.APP_VARIANT}`,
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<ImageItem>) => {
      if (type === "delete") {
        images$[value.image_id].delete();
      } else {
        // Wait for both pageItems$[value.id].created_at and images$[value.image_id].created_at
        return () => !!pageItems$[value.id]?.created_at?.get() && !!images$[value.image_id]?.created_at?.get();
      }
    },
    onError: (error: any) => {
      console.log("image items error", error);
      posthog.capture("image-items-sync-error", { error });
    },
  })
);
export const textItems$ = observable<Record<string, TextItem>>(
  customSupabaseSynced({
    supabase,
    collection: "text_items",
    select: (from: any) => from.select("*"),
    realtime: true,
    persist: {
      name: `text_items-${process.env.APP_VARIANT}`,
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<TextItem>) => {
      if (type !== "delete") {
        return pageItems$[value.id].created_at;
      }
    },
    onError: (error: any) => {
      console.log("text items error", error);
      posthog.capture("text-items-sync-error", { error });
    },
  })
);

interface PageStore {
  members: GroupMember[];
  dates: DateItem[];
  curRow: number;
  curCol: number;
  editMode: boolean;
  loadedPages: number;
  saving: boolean;
  ready: boolean;
}
export interface DateItem {
  id: string;
  date: string;
}
export interface PageMap {
  id: string;
  pages: Map<string, Canvas>;
}
// Constants

// Observable store for PageStore
export const pageStore$ = observable<PageStore>({
  members: [],
  dates: [],
  curRow: 0,
  curCol: 0,
  editMode: false,
  loadedPages: 0,
  saving: false,
  ready: false,
});
