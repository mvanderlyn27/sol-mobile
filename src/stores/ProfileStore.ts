import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember } from "../types/shared.types";
import authStore$ from "./AuthStore";

export const profiles$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "profiles",
    select: (from) => from.select("*"),
    filter: (select) => select.neq("deleted", true),
    // persist: { name: "profiles" },
    realtime: true,
  })
);
export const profileStore$ = observable({});
// addGroup

export const updateUsername = (username: string): { error: string | undefined } => {
  const curId = authStore$.session.user.id.get();
  if (!curId) {
    console.log("no user");
    return { error: "no user" };
  }
  if (Object.values(profiles$.get()).find((profile) => profile.username === username)) {
    console.log("username taken");
    return { error: "username in use" };
  }
  profiles$[curId].new.set(false);
  profiles$[curId].username.set(username);
  return { error: undefined };
};
