import { computed, observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember } from "../types/shared.types";
import { profiles$ } from "./ProfileStore";
import authStore$ from "./AuthStore";

// const transformGroupMembers = (membersMap: Record<string,GroupMember[]>) => {
//     const groupedMembersMap = {};

//     Object.values(membersMap).forEach(member => {
//       const groupId = member.group_id;

//       // Initialize the group if it doesn't exist
//       if (!groupedMembersMap[groupId]) {
//         groupedMembersMap[groupId] = [];
//       }

//       // Add the member to the corresponding group
//       groupedMembersMap[groupId].push(member);
//     });

//     return groupedMembersMap;
//   };
export const groupMembers$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "group_members",
    select: (from) => from.select("*"),
    filter: (select) => select.neq("status", "pending"),
    // persist: { name: "group_members" },
  })
);
export const myPendingGroupMembers$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "group_members",
    select: (from) => from.select("*"),
    filter: (select) => select.eq("status", "pending").eq("user_id", authStore$.session.get()?.user.id),
    // persist: { name: "group_members" },
  })
);
export const myGroupMemberships$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "group_members",
    select: (from) => from.select("*"),
    filter: (select) => select.eq("status", "completed").eq("user_id", authStore$.session.get()?.user.id),
    // persist: { name: "group_members" },
  })
);
export const getMember = (groupId: string, userId: string) => {
  const groupMembers = groupMembers$.get();
  console.log("group", groupMembers);
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
  console.log("profiles", profiles$.get());
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
