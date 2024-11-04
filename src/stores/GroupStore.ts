import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { resizeImage } from "../services/Media";
import authStore$ from "./AuthStore";

export const groups$ = observable(
  customSupabaseSynced({
    collection: "groups",
    select: (from) => from.select("*"),
    // persist: { name: "groups" },
  })
);
export const groupsStore$ = observable({
  selectedGroup: null,
});
// addGroup
export const addGroup = async (name: string, cover_uri: string, cover_placeholder: string) => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    console.error("not logged in, can't create group");
    return;
  }
  const id = generateId();
  groups$[id].set({
    name,
    created_by: session?.user.id,
  });
  console.log("initial creation done");
  const base64 = await FileSystem.readAsStringAsync(cover_uri, { encoding: "base64" });
  const { success, data, error } = await StorageService.uploadFile({
    bucket: "group_covers",
    filePath: `${id}/cover.webp`,
    base64: base64,
    fileExtension: "webp",
    mimeType: "image/webp",
  });
  console.log("done uploading", error, data, success);
  if (error || !data) {
    console.error("error uploading", error);
    //show notif here
    return;
  }
  const path = supabase.storage.from("group_covers").getPublicUrl(`${id}/cover.webp`);
  console.log("starting last update");
  groups$[id].set({
    cover_url: path.data.publicUrl,
    cover_placeholder,
  });
  console.log("finished last update");
};

export const deleteGroup = async (group_id: string) => {
  if (!Object.keys(groups$.get()).includes(group_id)) {
    console.error("id not in groups");
    return;
  }
  groups$[group_id].delete();
};
