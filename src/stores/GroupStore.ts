import { observable, syncState } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";

export const groups$ = observable(
  customSupabaseSynced({
    collection: "groups",
    select: (from) => from.select("*"),
    realtime: true,
    persist: {
      name: "groups",
      retrySync: true, // Persist pending changes and retry
    },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },
  })
);
interface GroupStore {
  selectedGroup: string | null;
}
export const groupStore$ = observable<GroupStore>({ selectedGroup: null });
// addGroup
