import { when } from "@legendapp/state";
import { Href, SplashScreen, router } from "expo-router";
import { useEffect, useState } from "react";
import authStore$ from "../stores/AuthStore";
import { groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
import { pages$ } from "../stores/PagesStore";
import { profiles$ } from "../stores/ProfileStore";
import * as Notifications from "expo-notifications";
import { addNotification } from "../stores/NotificationStore";
import { generateId } from "../stores/AsyncStorage";
import { NotificationType } from "../types/shared.types";

export const initializeStores = async () => {
  const profileReady = when(profiles$);
  const pagesReady = when(pages$);
  const groupReady = when(groups$);
  const groupMemberReady = when(groupMembers$);
  await Promise.all([profileReady, pagesReady, groupReady, groupMemberReady]);
};
export function useAppNavigation() {
  useEffect(() => {
    let notificationSubscription;

    const navigateApp = async () => {
      try {
        // Wait for auth to finish loading
        await when(() => !authStore$.loading.get());
        await initializeStores();

        // Check if the app was opened via a notification
        const response = await Notifications.getLastNotificationResponseAsync();
        const url = response?.notification?.request.content.data?.url;

        SplashScreen.hideAsync();

        if (url) {
          console.log("URL found");
          const isAuthenticated = authStore$.session.get() !== null;
          router.replace(isAuthenticated ? url : "/login");
        } else {
          console.log("URL not found");
          const isAuthenticated = authStore$.session.get() !== null;
          if (!isAuthenticated) {
            router.replace("/login");
          } else {
            const userId = authStore$.session.user.id.get();
            const profile = userId && profiles$[userId].get();
            if (profile && profile.new) {
              router.replace("/(ftux)/username");
            } else {
              router.replace("/home");
            }
          }
        }

        // Set up the notification listener after the app is initialized
        notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const url = response.notification.request.content.data?.url;
          console.log("Notification received:", url);

          if (url) {
            const isAuthenticated = authStore$.session.get() !== null;
            router.push(isAuthenticated ? url : "/login"); // Use push for better stack handling
          }
        });
      } catch (error) {
        console.error("Error during app navigation:", error);
        SplashScreen.hideAsync();
        addNotification({
          id: generateId(),
          message: "Error during app navigation",
          type: NotificationType.error,
        });
        router.replace("/login");
      }
    };
    navigateApp();
  }, []);
}
