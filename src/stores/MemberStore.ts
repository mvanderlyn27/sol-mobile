import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember } from "../types/shared.types";
import { groupsStore$ } from "./GroupStore";

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
    // persist: { name: "group_members" },
  })
);
export const selectedGroupMembers$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "group_members",
    select: (from) => from.select("*"),
    filter: (select) => select.eq("group_id", groupsStore$.selectedGroup.get()),
    // persist: { name: "group_members" },
    // as: "object",
  })
);

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
