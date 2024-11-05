import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { Group, GroupMember } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { resizeImage } from "../services/Media";
import authStore$ from "./AuthStore";
import { filterMyGroups, filterMyInvites, groupMembers$ } from "./MemberStore";

export const groups$ = observable(
  customSupabaseSynced({
    collection: "groups",
    select: (from) => from.select("*"),
    // persist: { name: "groups" },
    as: "object",
  })
);

// addGroup
export const addGroup = async (name: string, cover_uri: string, cover_placeholder: string): Promise<string | null> => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    console.error("not logged in, can't create group");
    return null;
  }
  const id = generateId();
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
    return null;
  }
  const path = supabase.storage.from("group_covers").getPublicUrl(`${id}/cover.webp`);
  console.log("starting last update");

  groups$[id].set({
    id,
    name,
    created_by: session?.user.id,
    cover_url: path.data.publicUrl,
    cover_placeholder,
  });
  console.log("finished last update");
  return id;
};

export const deleteGroup = async (group_id: string) => {
  if (!Object.keys(groups$.get()).includes(group_id)) {
    console.error("id not in groups");
    return;
  }
  groups$[group_id].delete();
};
