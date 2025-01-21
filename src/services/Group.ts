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
import { ApiService } from "./ApiService";
import { ErrorService } from "./ErrorService";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import { Blurhash } from "react-native-blurhash";

export const addGroup = async (name: string, cover_uri: string, cover_placeholder: string): Promise<string | null> => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    console.error("not logged in, can't create group");
    posthog.capture("add-group-error", { error: "not logged in" });
    return null;
  }
  const id = generateId();
  await ApiService.optimisticSave("groups", {
    id,
    name,
    created_by: session?.user.id,
  } as Group);
  const newGroupMemberId = generateId();
  await ApiService.optimisticSave("group_members", {
    id: newGroupMemberId,
    group_id: id,
    user_id: session?.user.id,
    role: "admin",
    status: "completed",
  } as GroupMember);

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
  await ApiService.optimisticSave("groups", {
    ...groups$[id].get(),
    cover_url: path.data.publicUrl,
    cover_placeholder,
  });
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
    ErrorService.handleError("Error joining group", "User not logged in");
    return null;
  }
  if (!Object.keys(groups$).includes(groupCode)) {
    ErrorService.handleError("Error joining group", "Group " + groupCode + " does not exist");
    return null;
  }
  const groupMemberId = generateId();
  await ApiService.optimisticSave("group_members", {
    id: groupMemberId,
    user_id: session?.user.id,
    group_id: groupCode,
    role: "member",
    status: "completed",
  } as GroupMember);
  return groupCode;
};
export const acceptInvite = async (memberId: string) => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    ErrorService.handleError("Error accepting invite", "User not logged in");
    return;
  }
  ApiService.optimisticSave("group_members", {
    ...groupMembers$[memberId].get(),
    status: "completed",
    user_id: session?.user.id,
  });
};
export const declineInvite = async (memberId: string) => {
  const session = authStore$.session.get();
  if (!session?.user.id) {
    ErrorService.handleError("Error declining invite", "User not logged in");
    return;
  }
  ApiService.optimisticDelete("group_members", memberId);
};

export const deleteGroup = async (group_id: string) => {
  if (!Object.keys(groups$.get() || {}).includes(group_id)) {
    console.error("id not in groups");
    return;
  }
  ApiService.optimisticDelete("groups", group_id);
};

export const updateGroup = async (group_id: string, group: Group) => {
  const { error } = await ApiService.optimisticSave("groups", group);
  if (error) {
    return { error };
  }
  return;
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
  const id = Object.entries(groupMembers || {}).find(
    ([, groupMember]) => groupMember.group_id === groupId && groupMember.user_id === userId
  )?.[0];
  return id;
};
export const removeMember = async (groupId: string, userId: string) => {
  const id = getMember(groupId, userId);
  if (!id) {
    posthog.capture("remove-member-error", { error: "user not found" });
    console.log("user not found");
    return;
  }
  const { error } = await ApiService.optimisticDelete("group_members", id);
  if (error) {
    console.error(error);
  } else {
    addNotification({
      id: generateId(),
      message: "Member removed",
      type: NotificationType.success,
    });
  }
};
export const updateGroupPhoto = async (groupId: string) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    const selectedImageUri = result.assets[0].uri;
    const blurhash = await ImageManipulator.manipulateAsync(
      selectedImageUri,
      [{ resize: { width: 100, height: 100 } }],
      {
        compress: 0.5,
        format: ImageManipulator.SaveFormat.PNG,
      }
    )
      .then((resizedImage) => Blurhash.encode(resizedImage.uri, 4, 3))
      .then((blurhash) => blurhash)
      .catch((error) => {
        ErrorService.handleError("update-group-error", "Error generating blurhash" + error);
        return null;
      });
    const image = await resizeImage(selectedImageUri, result.assets[0].width, result.assets[0].height)
      .then((image) => image)
      .catch((error) => {
        ErrorService.handleError("update-group-error", "Error resizing image " + error);
        return null;
      });

    if (!image || !blurhash) {
      return;
    }
    const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" });
    const { success, data, error } = await StorageService.uploadFile({
      bucket: "group_covers",
      filePath: `${groupId}/cover.webp`,
      base64: base64,
      fileExtension: "webp",
      mimeType: "image/webp",
    });
    console.log("done uploading", error, data, success);
    if (error || !data) {
      ErrorService.handleError("update-group-error", "Error uploading photo " + error);
      return null;
    }
    const path = supabase.storage.from("group_covers").getPublicUrl(`${groupId}/cover.webp`);
    console.log("starting last update");
    const { error: lastError } = await ApiService.optimisticSave("groups", {
      ...groups$[groupId].get(),
      cover_url: path.data.publicUrl + `?t=${new Date().toISOString()}`,
      cover_placeholder: blurhash,
    });
    if (lastError) {
      ErrorService.handleError("update-group-error", lastError + "");
      return;
    }
    return;
  }
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
  const entry = Object.values(profiles$.get() || {}).find((profile) => profile.username === username);
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
  ApiService.optimisticSave("group_members", invite);
  return inviteId;
};
