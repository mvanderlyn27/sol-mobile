import { when } from "@legendapp/state";
import { SplashScreen, router } from "expo-router";
import { useEffect } from "react";
import authStore$ from "../stores/AuthStore";
import { groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
import { allPages$ } from "../stores/PagesStore";
import { profiles$ } from "../stores/ProfileStore";
import * as Notifications from "expo-notifications";

export const initializeStores = async () => {
  const profileReady = when(profiles$);
  const pagesReady = when(allPages$);
  const groupReady = when(groups$);
  const groupMemberReady = when(groupMembers$);
  await Promise.all([profileReady, pagesReady, groupReady, groupMemberReady]);
};
export function useAppNavigation() {
  useEffect(() => {
    const navigateApp = async () => {
      // Wait for auth to finish loading
      await when(() => !authStore$.loading.get());
      await initializeStores();
      // Check if app was opened by a notification

      const response = await Notifications.getLastNotificationResponseAsync();
      const url = response?.notification?.request.content.data?.url;
      SplashScreen.hideAsync();
      if (url) {
        // Navigate based on the notification
        console.log("url found");
        const isAuthenticated = authStore$.session.get() !== null;
        router.replace(isAuthenticated ? url : "/login");
      } else {
        // Default navigation
        console.log("url not found");
        const isAuthenticated = authStore$.session.get() !== null;
        router.replace(isAuthenticated ? "/home" : "/login");
      }
    };
    navigateApp();
  }, []);
}
