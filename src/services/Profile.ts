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
