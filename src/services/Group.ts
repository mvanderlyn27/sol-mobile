import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { Group, GroupMember, NotificationType } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { resizeImage } from "../services/Media";
import { posthog } from "../services/Posthog";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
import { profiles$ } from "../stores/ProfileStore";
import { addNotification } from "../stores/NotificationStore";
import { useEffect } from "react";

export const addGroup = async (name: string, cover_uri: string, cover_placeholder: string): Promise<string | null> => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    console.error("not logged in, can't create group");
    posthog.capture("add-group-error", { error: "not logged in" });
    return null;
  }
  const id = generateId();

  groups$[id].set({
    id,
    name,
    created_by: session?.user.id,
  });

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
    posthog.capture("add-group-error", { error });
    return null;
  }

  console.log("finished last update");
  return id;
};

export const joinGroup = async (groupCode: string): Promise<string | null> => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    console.error("not logged in, can't create group");
    posthog.capture("add-group-error", { error: "not logged in" });
    return null;
  }
  if (!Object.keys(groups$).includes(groupCode)) {
    console.log("group doesn't exist");
    posthog.capture("join-group-error", { error: "group not found: " + groupCode });
    addNotification({
      id: generateId(),
      message: "Group not found, please try again",
      type: NotificationType.error,
    });
    return null;
  }
  const groupMemberId = generateId();
  groupMembers$[groupMemberId].set({
    id: groupMemberId,
    user_id: session?.user.id,
    group_id: groupCode,
    role: "member",
    status: "completed",
  } as GroupMember);
  return groupCode;
};

export const deleteGroup = async (group_id: string) => {
  if (!Object.keys(groups$.get()).includes(group_id)) {
    console.error("id not in groups");
    return;
  }
  groups$[group_id].delete();
};

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
    posthog.capture("check-admin-error", { error: "user not found " + userId });
    console.log("user not found");
    return;
  }
  return groupMembers$[id].role.get() === "admin";
};
export const inviteGroupMember = async (groupId: string, username: string): Promise<string | null> => {
  const entry = Object.values(profiles$.get()).find((profile) => profile.username === username);
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
  const inviteId = generateId();
  const invite = {
    id: inviteId,
    group_id: groupId,
    user_id: entry.id,
    role: "member",
    status: "pending",
  } as GroupMember;
  groupMembers$[inviteId].set(invite);
  return inviteId;
};

export const initializeGroupRealtimeUpdates = () => {
  useEffect(() => {
    const subscription = supabase
      .channel("realtime-groups")
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedGroupId = payload.old.id;
          groups$[deletedGroupId].delete();
        } else {
          const old = groups$.peek()[payload.new.id];
          const isOk =
            JSON.stringify({
              id: old?.id,
              name: old?.name,
              cover_url: old?.cover_url,
              cover_placeholder: old?.cover_placeholder,
              created_by: old?.created_by,
            }) !==
            JSON.stringify({
              id: payload.new.id,
              name: payload.new.name,
              cover_url: payload.new.cover_url,
              cover_placeholder: payload.new.cover_placeholder,
              created_by: payload.new.created_by,
            });
          if (isOk) {
            const newGroup: Group = payload.new as Group;
            // console.log("updating pages!", pages$[newPage.id].canvas.get() as Canvas);
            console.log("updating groups!", groups$[newGroup.id].updated_at.get());
            groups$[newGroup.id].set(newGroup);
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
};

export const initializeGroupMemberRealtimeUpdates = () => {
  useEffect(() => {
    const subscription = supabase
      .channel("realtime-groupmembers")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedGroupId = payload.old.id;
          groupMembers$[deletedGroupId].delete();
        } else {
          const old = groupMembers$.peek()[payload.new.id];
          const isOk =
            JSON.stringify({
              user_id: old?.user_id,
              group_id: old?.group_id,
              role: old?.role,
              status: old?.status,
              id: old?.id,
            }) !==
            JSON.stringify({
              user_id: payload.new.user_id,
              group_id: payload.new.group_id,
              role: payload.new.role,
              status: payload.new.status,
              id: payload.new.id,
            });
          console.log(
            "is ok to update? :",
            isOk,
            "\n",
            JSON.stringify(groupMembers$.peek()[payload.new.id]),
            JSON.stringify(payload.new)
          );
          if (isOk) {
            const newGroupMember: GroupMember = payload.new as GroupMember;
            console.log("new info", newGroupMember);
            groupMembers$[newGroupMember.id].set(newGroupMember);
            console.log("updating group members!", groupMembers$[newGroupMember.id].get());
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
};
