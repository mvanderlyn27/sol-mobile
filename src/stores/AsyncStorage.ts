import { configureSynced, syncObservable } from "@legendapp/state/sync";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureSyncedSupabase, syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";
export const generateId = () => uuidv4();

// Global configuration
export const persistOptions = configureSynced({
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
});
export const customSupabaseSynced = configureSynced(syncedSupabase, {
  // Use React Native Async Storage
  // persist: {
  //   plugin: observablePersistAsyncStorage({
  //     AsyncStorage,
  //   }),
  // },
  actions: ["read", "create", "update", "delete"],
  generateId,
  supabase,
  // changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  // fieldDeleted: "deleted",
});
