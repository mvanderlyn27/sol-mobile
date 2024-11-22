import { computed, observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember, NotificationType } from "../types/shared.types";
import { profiles$ } from "./ProfileStore";
import authStore$ from "./AuthStore";
import { posthog } from "../services/Posthog";
import { addNotification } from "./NotificationStore";

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
    .filter(([key, val]) => val.group_id === groupId && val.status === "completed")
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val as GroupMember }), {});
};
export const filterPendingGroupMembers = (
  map: Record<string, GroupMember>,
  groupId: string
): Record<string, GroupMember> | null => {
  if (!map || !groupId) {
    return null;
  }
  return Object.entries(map)
    .filter(([key, val]) => val.group_id === groupId && val.status === "pending")
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
    posthog.capture("remove-member-error", { error: "user not found" });
    console.log("user not found");
    return;
  }
  groupMembers$[id].delete();
};
export const checkAdmin = (groupId: string, userId: string) => {
  const id = getMember(groupId, userId);
  if (!id) {
    posthog.capture("check-admin-error", { error: "user not found" });
    console.log("user not found");
    return;
  }
  return groupMembers$[id].role.get() === "admin";
};
export const inviteGroupMember = (groupId: string, username: string): string | null => {
  const entry = Object.entries(profiles$.get()).find(([key, profile]) => profile.username === username);
  if (!entry) {
    posthog.capture("invite-group-member-error", { error: "user not found" });
    addNotification({
      id: generateId(),
      message: "User not found, please try again",
      type: NotificationType.error,
    });
    console.log("can't find user");
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
