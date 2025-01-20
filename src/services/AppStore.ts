import { observable, syncState, when } from "@legendapp/state";
import { pages$ } from "../stores/PagesStore";
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
const { height, width } = Dimensions.get("window");
interface AppStore {
  adjustedWidth: number;
  adjustedHeight: number;
}
export const appState$ = observable<AppStore>({
  adjustedHeight: height,
  adjustedWidth: width,
});
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
export const resyncObservables = async () => {
  console.log("resyncing observables");
  // const pagesState$ = syncState(pages$);

  // const reactionsState$ = syncState(reactions$);
  const syncPages = SyncService.syncData("pages");
  const syncReactions = SyncService.syncData("reactions");

  await Promise.all([syncPages, syncReactions]);
};

export const setupAppStateListener = () => {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("App is active, resyncing observables...");
        try {
          await resyncObservables();
          //   console.log("Observables resynced successfully");
        } catch (error) {
          posthog.capture("appstate-listener-failed", { message: error });
          addNotification({
            id: generateId(),
            type: NotificationType.error,
            message: "Failed to data is stale, please restart app",
          });
          console.error("Failed to resync observables:", error);
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
