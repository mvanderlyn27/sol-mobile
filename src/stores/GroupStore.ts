import { observable, syncState } from "@legendapp/state";
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
    filter: (select) => select.neq("deleted", true),
    // persist: { name: "groups" },
    // as: "object",
    realtime: true,
  })
);
interface GroupStore {
  selectedGroup: string | null;
}
export const groupStore$ = observable<GroupStore>({ selectedGroup: null });
// addGroup
export const addGroup = async (name: string, cover_uri: string, cover_placeholder: string): Promise<string | null> => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    console.error("not logged in, can't create group");
    return null;
  }
  const id = generateId();

  groups$[id].set({
    id,
    name,
    created_by: session?.user.id,
  });
  try {
    await waitForSync(groups$, id);
  } catch (error) {
    console.error("Error syncing group with Supabase:", error);
    return null;
  }
  const groupMemberId = generateId();
  groupMembers$[groupMemberId].set({
    id: groupMemberId,
    user_id: session?.user.id,
    group_id: id,
    role: "admin",
    status: "completed",
  });
  try {
    await waitForSync(groupMembers$, groupMemberId);
  } catch (error) {
    console.error("Error syncing group member with Supabase:", error);
    return null;
  }

  //upload image after we create new component for rls policies to work
  const base64 = await FileSystem.readAsStringAsync(cover_uri, { encoding: "base64" });
  const { success, data, error } = await StorageService.uploadFile({
    bucket: "group_covers",
    filePath: `${id}/cover.webp`,
    base64: base64,
    fileExtension: "webp",
    mimeType: "image/webp",
  });
  const path = supabase.storage.from("group_covers").getPublicUrl(`${id}/cover.webp`);
  console.log("starting last update");
  groups$[id].cover_url.set(path.data.publicUrl);
  groups$[id].cover_placeholder.set(cover_placeholder);
  console.log("done uploading", error, data, success);
  if (error || !data) {
    console.error("error uploading", error);
    //show notif here
    return null;
  }

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

const waitForSync = async (store: any, id: string, timeout = 5000): Promise<void> => {
  const start = Date.now();

  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(async () => {
      // Check if the timeout has elapsed
      if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout waiting for sync"));
        return;
      }

      // Check if the group exists in Supabase
      const { data, error } = await supabase
        .from(store === groups$ ? "groups" : "group_members")
        .select("id")
        .eq("id", id)
        .single();

      if (data) {
        clearInterval(interval);
        resolve();
      } else if (error) {
        console.error("Sync check error:", error);
      }
    }, 200); // Check every 200ms
  });
};
