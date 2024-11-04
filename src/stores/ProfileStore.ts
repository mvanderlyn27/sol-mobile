import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember } from "../types/shared.types";

export const profiles$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "profiles",
    select: (from) => from.select("*"),
    // persist: { name: "groups" },
  })
);
export const profileStore$ = observable({});
// addGroup
