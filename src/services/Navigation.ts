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

// export const initializeStores = async () => {
//   //want to wait until these are all synced
//   const profileReady = syncState(profiles$).sync();
//   const pagesReady = syncState(pages$).sync();
//   const pageItems = syncState(pageItems$).sync();
//   const textItems = syncState(textItems$).sync();
//   const imageItems = syncState(imagesItems$).sync();
//   const reactions = syncState(pageReactions$).sync();
//   const reactionItems = syncState(reactionItems$).sync();
//   const reactionTextItem = syncState(reactionTextItems$).sync();
//   const groupReady = syncState(groups$).sync();
//   const groupMemberReady = syncState(groupMembers$).sync();
//   const out = await Promise.all([
//     profileReady,
//     pagesReady,
//     groupReady,
//     groupMemberReady,
//     pageItems,
//     textItems,
//     imageItems,
//     reactions,
//     reactionItems,
//     reactionTextItem,
//   ]);
//   console.log("stores", profiles$.get());
// };
export function useAppNavigation() {
  useEffect(() => {
    let notificationSubscription;

    const navigateApp = async () => {
      try {
        // Wait for auth to finish loading
        // await initializeStores();
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

          if (url) {
            const isAuthenticated = authStore$.session.get() !== null;
            //hack to get journal working, fixes issue when journal is already open and notification comes in
            pageStore$.ready.set(false);
            router.replace(isAuthenticated ? url : "/login"); // Use push for better stack handling
          }
        });
      } catch (error) {
        console.error("Error during app navigation:", error);
        addNotification({
          id: generateId(),
          message: "Error during app navigation",
          type: NotificationType.error,
        });
        // router.replace("/login");
      }
    };
    navigateApp();
  }, []);
}
