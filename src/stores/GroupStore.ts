import { observable } from "@legendapp/state";
import { customSupabaseSynced } from "./AsyncStorage";

export const groups$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "groups",
    select: (from) => from.select("*"),
    persist: { name: "groups" },
  })
);
interface GroupStore {
  currentGroup: string | null;
}
const groupStore$ = observable<GroupStore>({
  currentGroup: null,
});
// addGroup
