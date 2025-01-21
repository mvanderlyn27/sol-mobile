import { observable } from "@legendapp/state";
import { Group } from "../types/shared.types";

// export const groups$ = observable(
//   customSupabaseSynced({
//     collection: "groups",
//     select: (from) => from.select("*"),
//     realtime: true,
//     persist: {
//       name: `groups-${process.env.APP_VARIANT}`,
//       retrySync: true, // Persist pending changes and retry
//     },
//     retry: {
//       infinite: true, // Retry changes with exponential backoff
//     },
//     onError: (error) => {
//       console.log("error with group store", error);
//     },
//   })
// );

export const groups$ = observable<Record<string, Group>>();
interface GroupStore {
  selectedGroup: string | null;
}
export const groupStore$ = observable<GroupStore>({ selectedGroup: null });
// addGroup
