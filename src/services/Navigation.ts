import { syncState, when } from "@legendapp/state";
import { Href, SplashScreen, router } from "expo-router";
import { useEffect, useState } from "react";
import authStore$ from "../stores/AuthStore";
import { groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
import { pageStore$, pages$ } from "../stores/PagesStore";
import { profiles$ } from "../stores/ProfileStore";
import * as Notifications from "expo-notifications";
import { addNotification } from "../stores/NotificationStore";
import { generateId } from "../stores/AsyncStorage";
import { NotificationType } from "../types/shared.types";

export function useAppNavigation() {
  useEffect(() => {
    let notificationSubscription;

    const navigateApp = async () => {
      try {
        // Wait for auth to finish loading
        const userId = authStore$.session.user.id.get();
        if (!userId) {
          SplashScreen.hideAsync();
          router.navigate("/login");
          return;
        }
        SplashScreen.hideAsync();
        const profile = await when(profiles$[userId]);
        // Check if the app was opened via a notification
        const response = await Notifications.getLastNotificationResponseAsync();
        const url = response?.notification?.request.content.data?.url;
        if (url) {
          router.replace(url);
        } else {
          if (profile && profile.new) {
            router.replace("/(ftux)/username");
          } else {
            router.replace("/home");
          }
        }
        // Set up the notification listener after the app is initialized
        notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const url = response.notification.request.content.data?.url;
          console.log("Notification received:", url);
          const isAuthenticated = authStore$.session.get() !== null;
          //hack to get journal working, fixes issue when journal is already open and notification comes in
          pageStore$.ready.set(false);
          if (isAuthenticated) {
            router.replace(url ? url : "/home"); // Use push for better stack handling
          } else {
            router.replace("/login");
          }
        });
      } catch (error) {
        console.error("Error during app navigation:", error);
        addNotification({
          id: generateId(),
          message: "Error during app navigation",
          type: NotificationType.error,
        });
        postMessage({
          type: "error",
          message: "Error during app navigation",
          error: "error during app navigation" + error,
        });
        const isAuthenticated = authStore$.session.get() !== null;
        if (isAuthenticated) {
          router.replace("/home"); // Use push for better stack handling
        } else {
          router.replace("/login");
        }
      }
    };
    navigateApp();
  }, []);
}
