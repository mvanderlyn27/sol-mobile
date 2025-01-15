import { observable, syncState } from "@legendapp/state";
import { Canvas, GroupMember, Page, Image } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { customSupabaseSynced } from "./AsyncStorage";

import { posthog } from "../services/Posthog";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
import { groupStore$ } from "./GroupStore";

interface PageStore {
  members: GroupMember[];
  dates: DateItem[];
  startDate: string | null;
  endDate: string | null;
  curRow: number;
  curCol: number;
  curPageId: string | null;
  editMode: boolean;
  loadedPages: number;
  saving: boolean;
  loading: boolean;
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
  startDate: null,
  endDate: null,
  curRow: 0,
  curCol: 0,
  curPageId: null,
  editMode: false,
  loadedPages: 0,
  saving: false,
  loading: false,
  ready: false,
});

// export const pages$ = observable<Record<string, Page>>({});

export const pages$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "pages",
    realtime: true,
    persist: {
      name: `pages-${process.env.APP_VARIANT}`,
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },

    select: (from) => {
      const selectedGroup = groupStore$.selectedGroup.get();
      if (!selectedGroup) {
        return from.select().limit(0);
      }
      return from.select("*").eq("group_id", selectedGroup);
    },
    onError: (error) => {
      console.log("pages error", error);
    },
  })
);

interface CanvasStore {
  canvas: Canvas | null;
}
export const canvasStore$ = observable<CanvasStore>({
  canvas: null,
});
