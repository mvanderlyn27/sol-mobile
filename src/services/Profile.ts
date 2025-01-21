import Constants from "expo-constants";
import { generateId } from "../stores/AsyncStorage";
import authStore$ from "../stores/AuthStore";
import { addNotification } from "../stores/NotificationStore";
import { profiles$ } from "../stores/ProfileStore";
import { Profile, NotificationType } from "../types/shared.types";
import { posthog } from "./Posthog";
import { checkNotificationStatus, registerForPushNotificationsAsync } from "./PushNotification";
import * as Device from "expo-device";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ApiService } from "./ApiService";
import { ErrorService } from "./ErrorService";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { Blurhash } from "react-native-blurhash";
import { resizeImage } from "./Media";

// addGroup
export const handleSignup = (userId: string) => {
  if (!profiles$[userId].get()) {
    //set profile if its not existing
    ApiService.optimisticSave("profiles", { id: userId, new: true } as Profile);
  }
};
export const updateUsername = (username: string): { error: string | undefined } => {
  const curId = authStore$.session.user.id.get();
  if (!curId) {
    ErrorService.handleError("update-username-error", "no user");
    return { error: "no user" };
  }
  if (Object.values(profiles$.get() || {}).find((profile) => profile.username === username)) {
    ErrorService.handleError("update-username-error", "username in use");
    return { error: "username in use" };
  }
  ApiService.optimisticSave("profiles", { ...profiles$[curId].get(), new: false, username: username } as Profile);
  return { error: undefined };
};
export const setProfilePic = async (userId: string) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled) {
    const selectedImageUri = result.assets[0].uri;
    // Resize the image to 100x100 using ImageManipulator
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
        ErrorService.handleError("update-group-error", "Error resizing image" + error);
        return null;
      });

    if (!image || !blurhash) {
      ErrorService.handleError("update-group-error", "Error getting image or blurhash");
      return;
    }
    const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" });
    const { success, data, error } = await StorageService.uploadFile({
      bucket: "avatars",
      filePath: `${userId}/avatar.webp`,
      base64: base64,
      fileExtension: "webp",
      mimeType: "image/webp",
    });
    console.log("done uploading", error, data, success);
    if (error || !data) {
      ErrorService.handleError("update-group-error", "Error uploading image" + error);
      return null;
    }
    const path = supabase.storage.from("avatars").getPublicUrl(`${userId}/avatar.webp`);
    await ApiService.optimisticSave("profiles", {
      ...profiles$[userId].get(),
      avatar_url: path.data.publicUrl + `?t=${new Date().toISOString()}`,
      avatar_placeholder: blurhash,
    } as Profile);
  }
};
export const requestPushNotificationPermission = async (): Promise<boolean> => {
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  console.log("project", projectId);
  if (!Device.isDevice) {
    return false;
  }
  const curId = authStore$.session.user.id.get();
  if (!curId) {
    ErrorService.handleError("push-notification-error", "no user");
    return false;
  }
  const profile = profiles$[curId].get();
  if (!profile) {
    ErrorService.handleError("push-notification-error", "no profile");
    return false;
  }
  const status = await checkNotificationStatus();
  if (status === "denied") {
    addNotification({
      id: generateId(),
      message: "Notifications are disabled, enable in Settings",
      type: NotificationType.info,
    });
    return false;
  }
  if (profile.push_token) {
    //found token
    addNotification({
      id: generateId(),
      message: "Push notifications already enabled",
      type: NotificationType.info,
    });
    return true;
  }
  const token = await registerForPushNotificationsAsync();
  if (!token) {
    //user doesn't want to receive notifications
    addNotification({
      id: generateId(),
      message: "Notifications are disabled, enable in Settings",
      type: NotificationType.info,
    });
    return false;
  }
  addNotification({
    id: generateId(),
    message: "Push notifications enabled!",
    type: NotificationType.info,
  });
  ApiService.optimisticSave("profiles", {
    ...profile,
    push_token: token,
  });
  return true;
};
