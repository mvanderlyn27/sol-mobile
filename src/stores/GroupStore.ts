import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";

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
export const addGroup = async (name: string, cover_uri: string, cover_placeholder: string) => {
  const id = generateId();
  groups$[id].set({
    name,
    cover_url: "",
    cover_placeholder: "",
  });
  const base64 = await FileSystem.readAsStringAsync(cover_uri, { encoding: "base64" });
  const { success, data, error } = await StorageService.uploadFile({
    bucket: "group_photos",
    filePath: `${id}/cover.webp`,
    base64: base64,
    fileExtension: "",
    mimeType: "",
  });
  if (error || !data) {
    console.error("error uploading");
    //show notif here
    return;
  }
};
