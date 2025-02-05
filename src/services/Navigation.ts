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
import { resyncObservables } from "./AppService";
import * as Linking from "expo-linking";

export function useAppNavigation() {
  useEffect(() => {
    let notificationSubscription: Notifications.Subscription;

    const handleNotification = async () => {
      const response = await Notifications.getLastNotificationResponseAsync();
      return response?.notification?.request.content.data?.url;
    };

    const handleProfileCheck = (userId: string) => {
      const profile = profiles$[userId].get();
      if (profile && profile.new) {
        router.replace("/(ftux)/username");
      } else {
        router.replace("/home");
      }
    };

    const navigateApp = async () => {
      try {
        const userId = authStore$.session.user.id.get();

        // Handle unauthenticated users
        if (!userId) {
          SplashScreen.hideAsync();
          router.navigate("/login");
          return;
        }

        SplashScreen.hideAsync();
        await resyncObservables();

        // Handle notifications
        const notificationUrl = await handleNotification();
        if (notificationUrl) {
          router.replace(notificationUrl);
        } else {
          handleProfileCheck(userId);
        }

        // Set up notification listener
        notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const url = response.notification.request.content.data?.url;
          console.log("Notification received:", url);
          const isAuthenticated = authStore$.session.get() !== null;
          pageStore$.ready.set(false); // Hack to fix journal issue
          router.replace(isAuthenticated ? url || "/home" : "/login");
        });
      } catch (error) {
        console.error("Error during app navigation:", error);
        addNotification({
          id: generateId(),
          message: "Error during app navigation",
          type: NotificationType.error,
        });
        const isAuthenticated = authStore$.session.get() !== null;
        router.replace(isAuthenticated ? "/home" : "/login");
      }
    };

    navigateApp();

    // Clean up notification listener
    return () => {
      if (notificationSubscription) {
        notificationSubscription.remove();
      }
    };
  }, []);
}
