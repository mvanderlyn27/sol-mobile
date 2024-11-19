import { computed, observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember } from "../types/shared.types";
import { profiles$ } from "./ProfileStore";
import authStore$ from "./AuthStore";

export const groupMembers$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "group_members",
    select: (from) => from.select("*"),
    // filter: (select) => select.eq("status", "completed"),
    // filter: (select) => select.neq("deleted", true),
    // persist: { name: "group_members" },
    realtime: true,
  })
);
export const filterOutPending = (map: Record<string, GroupMember>): Record<string, GroupMember> | null => {
  if (!map) {
    return null;
  }
  return Object.entries(map)
    .filter(([key, val]) => (val as GroupMember).status === "completed")
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val as GroupMember }), {});
};
export const filterMyGroups = (
  map: Record<string, GroupMember>,
  userId: string
): Record<string, GroupMember> | null => {
  if (!map || !userId) {
    return null;
  }
  const out = Object.entries(map)
    .filter(([key, val]) => val.status === "completed" && val.user_id === userId)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val as GroupMember }), {});
  return out;
};
export const filterMyInvites = (
  map: Record<string, GroupMember>,
  userId: string
): Record<string, GroupMember> | null => {
  if (!map || !userId) {
    return null;
  }
  return Object.entries(map)
    .filter(([key, val]) => val.status === "pending" && val.user_id === userId)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val as GroupMember }), {});
};
export const filterGroupMembers = (
  map: Record<string, GroupMember>,
  groupId: string
): Record<string, GroupMember> | null => {
  if (!map || !groupId) {
    return null;
  }
  return Object.entries(map)
    .filter(([key, val]) => val.group_id === groupId)
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val as GroupMember }), {});
};
export const getMember = (groupId: string, userId: string) => {
  const groupMembers = groupMembers$.get();
  console.log(groupId, userId);
  const id = Object.entries(groupMembers).find(
    ([, groupMember]) => groupMember.group_id === groupId && groupMember.user_id === userId
  )?.[0];
  return id;
};
export const removeMember = (groupId: string, userId: string) => {
  const id = getMember(groupId, userId);
  if (!id) {
    console.log("user not found");
    return;
  }
  groupMembers$[id].delete();
};
export const checkAdmin = (groupId: string, userId: string) => {
  const id = getMember(groupId, userId);
  if (!id) {
    console.log("user not found");
    return;
  }
  return groupMembers$[id].role.get() === "admin";
};
export const inviteGroupMember = (groupId: string, username: string): string | null => {
  const entry = Object.entries(profiles$.get()).find(([key, profile]) => profile.username === username);
  if (!entry) {
    console.error("can't find user");
    return null;
  }
  const id = entry[0];
  const inviteId = generateId();
  groupMembers$[inviteId].set({
    id: inviteId,
    group_id: groupId,
    user_id: id,
    role: "member",
    status: "pending",
  });
  return inviteId;
};
export const acceptGroupInvite = (groupId: string) => {};
// addGroup
export const addGroupMember = async (name: string, cover_uri: string, cover_placeholder: string) => {
  //   const id = generateId();
  //   groups$[id].set({
  //     name,
  //     cover_url: "",
  //     cover_placeholder: "",
  //   });
  //   const base64 = await FileSystem.readAsStringAsync(cover_uri, { encoding: "base64" });
  //   const { success, data, error } = await StorageService.uploadFile({
  //     bucket: "group_photos",
  //     filePath: `${id}/cover.webp`,
  //     base64: base64,
  //     fileExtension: "",
  //     mimeType: "",
  //   });
  //   if (error || !data) {
  //     console.error("error uploading");
  //     //show notif here
  //     return;
  //   }
};

export const deleteGroupMember = async (group_id: string) => {
  //   if (!Object.keys(groups$.get()).includes(group_id)) {
  //     console.error("id not in groups");
  //     return;
  //   }
  //   groups$[group_id].delete();
};
