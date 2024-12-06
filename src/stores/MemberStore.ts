import { observable } from "@legendapp/state";
import { customSupabaseSynced } from "./AsyncStorage";
import { GroupMember } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
import { groups$ } from "./GroupStore";

export const groupMembers$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "group_members",
    select: (from) => from.select("*"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "groupMembers",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
    waitForSet: ({ value }): WaitForSetCrudFnParams<GroupMember> => groups$[value.group_id].created_at,
  })
);
