import { observable } from "@legendapp/state";
import { customSupabaseSynced, generateId } from "./AsyncStorage";
import * as FileSystem from "expo-file-system";
import StorageService from "../api/storage";
import { GroupMember, NotificationType } from "../types/shared.types";
import authStore$ from "./AuthStore";
import { posthog } from "../services/Posthog";
import { checkNotificationStatus, registerForPushNotificationsAsync } from "../services/PushNotification";
import { addNotification, notificationStore$ } from "./NotificationStore";
import * as Device from "expo-device";
import Constants from "expo-constants";
export const profiles$ = observable(
  customSupabaseSynced({
    // supabase,
    collection: "profiles",
    select: (from) => from.select("*"),
    filter: (select) => select.neq("deleted", true),
    // persist: { name: "profiles" },
    realtime: true,
  })
);
export const profileStore$ = observable({});
// addGroup

export const updateUsername = (username: string): { error: string | undefined } => {
  const curId = authStore$.session.user.id.get();
  if (!curId) {
    console.log("no user");
    posthog.capture("update-username-error", { error: "no user" });
    return { error: "no user" };
  }
  if (Object.values(profiles$.get()).find((profile) => profile.username === username)) {
    console.log("username taken");
    posthog.capture("update-username-error", { error: "username in use" });
    return { error: "username in use" };
  }
  profiles$[curId].new.set(false);
  profiles$[curId].username.set(username);
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
    console.log("no user");
    posthog.capture("push-notification-error", { error: "no user" });
    return false;
  }
  const profile = profiles$[curId].get();
  if (!profile) {
    console.log("no user");
    posthog.capture("push-notification-error", { error: "no user" });
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
  profiles$[curId].push_token.set(token);
  return true;
};
