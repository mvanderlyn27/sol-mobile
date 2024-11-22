import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { router } from "expo-router";
import { addNotification } from "../stores/NotificationStore";
import { generateId } from "../stores/AsyncStorage";
import { NotificationType } from "../types/shared.types";
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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus === "denied") {
      console.log("push notifications off");
      return null;
    }
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      addNotification({
        id: generateId(),
        message: "Push notifications not enabled",
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

export async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: "Here is the notification body",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: { seconds: 2 } as Notifications.TimeIntervalTriggerInput,
  });
}

export async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

export function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
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
