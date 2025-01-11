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

// addGroup
export const handleSignup = (userId: string) => {
  if (!profiles$[userId].get()) {
    //set profile if its not existing
    profiles$[userId].set({ id: userId, new: true } as Profile);
  }
};
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

export const initializeProfileRealtimeUpdates = () => {
  useEffect(() => {
    const subscription = supabase
      .channel("realtime-profiles")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const deletedProfileId = payload.old.id;
          profiles$[deletedProfileId].delete();
        } else {
          const old = profiles$.peek()[payload.new.id];
          const isOk =
            JSON.stringify({
              id: old?.id,
              username: old?.username,
              push_token: old?.push_token,
              avatar_url: old?.avatar_url,
              avatar_placeholder: old?.avatar_placeholder,
              new: old?.new,
              should_reset_storage: old?.should_reset_storage,
              push_enabled: old?.push_enabled,
              should_clear_storage: old?.should_clear_storage,
            }) !==
            JSON.stringify({
              id: payload.new.id,
              username: payload.new.username,
              push_token: payload.new.push_token,
              avatar_url: payload.new.avatar_url,
              avatar_placeholder: payload.new.avatar_placeholder,
              new: payload.new.new,
              should_reset_storage: payload.new.should_reset_storage,
              push_enabled: payload.new.push_enabled,
              should_clear_storage: payload.new.should_clear_storage,
            });
          if (isOk) {
            const newProfile: Profile = payload.new as Profile;
            // console.log("updating pages!", pages$[newPage.id].canvas.get() as Canvas);
            console.log("updating profile!", profiles$[newProfile.id].updated_at.get());
            profiles$[newProfile.id].set(newProfile);
          }
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
};
