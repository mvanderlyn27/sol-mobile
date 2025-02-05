import { observable, syncState, when } from "@legendapp/state";
import { pageStore$, pages$ } from "../stores/PagesStore";
import { groupStore$, groups$ } from "../stores/GroupStore";
import { groupMembers$ } from "../stores/MemberStore";
import { profiles$ } from "../stores/ProfileStore";
import { useEffect } from "react";
import { AppStateStatus, AppState, Dimensions } from "react-native";
import { posthog } from "./Posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authStore$ from "../stores/AuthStore";
import { signOut } from "./Auth";
import { reactions$ } from "../stores/ReactStore";
import { addNotification } from "../stores/NotificationStore";
import { NotificationType } from "../types/shared.types";
import { generateId } from "../stores/AsyncStorage";
import { SyncService } from "./SyncService";
import { appState$ } from "../stores/AppStore";
import { ErrorService } from "./ErrorService";
const { height, width } = Dimensions.get("window");

export const initAppDimensions = () => {
  const aspectRatio = 9 / 18;
  appState$.adjustedWidth.set(width);
  appState$.adjustedHeight.set(width / aspectRatio);

  if (appState$.adjustedHeight.peek() > height) {
    // If the calculated height is greater than the screen height, adjust the width
    appState$.adjustedHeight.set(height);
    appState$.adjustedWidth.set(height * aspectRatio);
  }
};

export const clearLocalPersist = async () => {
  AsyncStorage.clear();
  signOut();
};

export const resyncObservables = async (
  observables: string[] = ["pages", "reactions", "groups", "groupMembers", "profiles"]
) => {
  const observablesToSync: Promise<void>[] = [];

  if (observables.includes("pages")) {
    observablesToSync.push(SyncService.syncData("pages"));
  }
  if (observables.includes("reactions")) {
    observablesToSync.push(SyncService.syncData("reactions"));
  }
  if (observables.includes("groups")) {
    observablesToSync.push(SyncService.syncData("groups"));
  }
  if (observables.includes("groupMembers")) {
    observablesToSync.push(SyncService.syncData("group_members"));
  }
  if (observables.includes("profiles")) {
    observablesToSync.push(SyncService.syncData("profiles"));
  }

  console.log("Syncing observables:", observables);

  try {
    // Attempt to sync all observables
    await Promise.all(observablesToSync);
    console.log("All observables synced successfully");
  } catch (error) {
    throw new Error("Failed to sync observables"); // Throw an error if any sync fails
  }
};

export const setupAppStateListener = () => {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("App is active, resyncing observables...");
        pageStore$.ready.set(false);

        try {
          await resyncObservables();
          console.log("Observables resynced successfully");
        } catch (error) {
          // If the app is not offline, handle the error using ErrorService
          console.log("offline: ", appState$.offline.get());
          if (!appState$.offline.get()) {
            console.error("Failed to resync observables:", error);
            ErrorService.handleError("Failed to sync observables", JSON.stringify(error) || "Unknown error");
          }
        } finally {
          pageStore$.ready.set(true);
        }
      }
    };

    // Add the app state change listener
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Cleanup the listener on unmount
    return () => {
      subscription.remove();
    };
  }, []);
};
