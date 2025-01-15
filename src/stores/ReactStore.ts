import { observable } from "@legendapp/state";
import { Dimensions } from "react-native";
import { customSupabaseSynced } from "./AsyncStorage";
import { supabase } from "../lib/supabase";
import { pageStore$, pages$ } from "./PagesStore";
import { posthog } from "../services/Posthog";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
import { groupStore$ } from "./GroupStore";
import { CanvasReaction, Reaction } from "../types/shared.types";

//@ts-ignore
export const reactions$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "reactions",
    // realtime: true,
    // persist: {
    //   name: `reactions-${process.env.APP_VARIANT}`,
    //   retrySync: true, // Persist pending changes and retry
    // },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },

    select: (from: any) =>
      from.select("*").in(
        "page_id",
        Object.values(pages$.get()).map((p) => p.id)
      ),
    waitForSet: ({ value }: WaitForSetCrudFnParams<Reaction>) => {
      return pages$[value.page_id].created_at;
    },
    onError: (error: any) => {
      console.log("page reaction error", error);
      posthog.capture("page-reaction-sync-error", { error });
    },
  })
);

interface ReactStore {
  showReactions: boolean;
  showNonUserReactions: boolean;
  reactEditMode: boolean;
  curReactionId: string | null;
  reaction: CanvasReaction | null;
}

// Observable store
export const reactStore$ = observable<ReactStore>({
  showReactions: true,
  showNonUserReactions: true,
  reactEditMode: false,
  curReactionId: null,
  reaction: null,
});
