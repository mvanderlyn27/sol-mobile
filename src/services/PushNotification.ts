import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { SplashScreen, router } from "expo-router";
import { addNotification, notificationStore$ } from "../stores/NotificationStore";
import { generateId } from "../stores/AsyncStorage";
import { NotificationType } from "../types/shared.types";
import { when } from "@legendapp/state";
import authStore$ from "../stores/AuthStore";
import { profiles$ } from "../stores/ProfileStore";
import { groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
export async function checkNotificationStatus(): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    let existingStatus = await checkNotificationStatus();

    if (existingStatus !== "granted") {
      //if we don't have permission, ask for it
      const { status } = await Notifications.requestPermissionsAsync();
      existingStatus = status;
    }
    if (existingStatus !== "granted") {
      addNotification({
        id: generateId(),
        message: "Push notifications disabled, enable via settings",
        type: NotificationType.info,
      });
      return null;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        addNotification({
          id: generateId(),
          message: "Project ID not found",
          type: NotificationType.error,
        });
        throw new Error("Project ID not found");
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      addNotification({
        id: generateId(),
        message: `Failed to get token ${e}`,
        type: NotificationType.error,
      });
    }
  } else {
    addNotification({
      id: generateId(),
      message: "Notifications can only be used on a physical device",
      type: NotificationType.error,
    });
  }

  return token || null;
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string, data: any) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: data,
  };
  await Notifications.scheduleNotificationAsync({
    content: message,
    trigger: { seconds: 0 } as Notifications.TimeIntervalTriggerInput,
  });
}

async function requestPermissions() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Notifications permission is required to receive reminders.");
      return false;
    }
    return true;
  } else {
    alert("Must use physical device for notifications.");
    return false;
  }
}
export async function scheduleDailyReminder(hour: number, minutes: number) {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync(); // Clear previous schedules if needed

  const trigger = {
    hour: hour, // Change to your preferred hour (24-hour format)
    minute: minutes, // Change to your preferred minute
    repeats: true, // Ensure it repeats daily
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Reminder",
      body: "Don't forget to log your journal entry today!",
      sound: true, // Play a sound
    },
    trigger,
  });

  addNotification({
    id: generateId(),
    message: "Daily reminder set!",
    type: NotificationType.info,
  });
}
async function cancelDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  addNotification({
    id: generateId(),
    message: "Daily reminder canceled",
    type: NotificationType.info,
  });
}
