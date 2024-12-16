import { observable } from "@legendapp/state";
import { PageReaction, ReactionItem, ReactionTextItem } from "../types/shared.types";
import { Dimensions } from "react-native";
import { customSupabaseSynced } from "./AsyncStorage";
import { supabase } from "../lib/supabase";
import { pageStore$, pages$ } from "./PagesStore";
import { posthog } from "../services/Posthog";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
import { groupStore$ } from "./GroupStore";

//@ts-ignore
export const pageReactions$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "page_reactions",
    select: (from: any) => {
      const pages = Object.values(pages$.get())
        .map((val) => val.id)
        .filter((val) => !!val);
      // console.log("pages from pageItem", pages);
      if (!pages.length) {
        return from.select("*").limit(0);
      }
      return from.select("*").in("page_id", pages);
    },
    actions: ["read", "create", "update", "delete"],
    realtime: true,

    // persist: {
    //   name: `page_reactions-${process.env.APP_VARIANT}`,
    //   //for some reason this is needed to make the real time syncing consistent
    //   retrySync: true, // Persist pending changes and retry
    // },
    // retry: {
    //   infinite: true, // Retry changes with exponential backoff
    // },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<PageReaction>) => {
      if (type === "delete") {
        const reactions$ = Object.values(reactionItems$).forEach((item$) => {
          if (item$.page_reaction_id.get() === value.id) {
            item$.delete();
          }
        });
      } else {
        return pages$[value.page_id].created_at;
      }
    },
    onError: (error: any) => {
      console.log("page reaction error", error);
      posthog.capture("page-reaction-sync-error", { error });
    },
  })
);
export const reactionItems$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "reaction_items",
    select: (from) => {
      const pageReactions = Object.values(pageReactions$.get()).map((val) => val.id);
      if (!pageReactions.length) {
        return from.select("*").limit(0);
      }
      return from.select("*").in("page_reaction_id", pageReactions);
    },
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    // persist: {
    //   name: `reaction_items-${process.env.APP_VARIANT}`,
    //   //for some reason this is needed to make the real time syncing consistent
    //   retrySync: true, // Persist pending changes and retry
    // },
    // retry: {
    //   infinite: true, // Retry changes with exponential backoff
    // },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<ReactionItem>) => {
      if (type === "delete") {
        switch (value.type) {
          case "text": {
            console.log("deleting reaction text item before reaction item");
            reactionTextItems$[value.id].delete();
            break;
          }
        }
      } else {
        return pageReactions$[value.page_reaction_id].created_at;
      }
    },
    onError: (error: any) => {
      console.log("reaction item error", error);
      posthog.capture("reaction-item-sync-error", { error });
    },
  })
);
export const reactionTextItems$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "reaction_text_items",
    select: (from: any) => {
      const reactionItems = Object.values(reactionItems$.get()).map((val) => val.id);
      if (!reactionItems.length) {
        return from.select("*").limit(0);
      }
      return from.select("*").in("id", reactionItems);
    },
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    // persist: {
    //   name: `reaction_text_items-${process.env.APP_VARIANT}`,
    //   //for some reason this is needed to make the real time syncing consistent
    //   retrySync: true, // Persist pending changes and retry
    // },
    // retry: {
    //   infinite: true, // Retry changes with exponential backoff
    // },
    waitForSet: ({ value, type }: WaitForSetCrudFnParams<ReactionTextItem>) => {
      if (type !== "delete") {
        return reactionItems$[value.id].created_at;
      }
    },
    onError: (error: any) => {
      posthog.capture("reaction-text-item-sync-error", { error });
    },
  })
);
interface ReactStore {
  showReactions: boolean;
  showNonUserReactions: boolean;
  reactEditMode: boolean;
  curPageReactionId: string | null;
  curPageReactionDraftId: string | null;
}

const { width, height } = Dimensions.get("window");

// Observable store
export const reactStore$ = observable<ReactStore>({
  showReactions: true,
  showNonUserReactions: true,
  reactEditMode: false,
  curPageReactionId: null,
  curPageReactionDraftId: null,
});
