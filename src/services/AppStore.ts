import { syncState } from "@legendapp/state";
import { pages$ } from "../stores/PagesStore";
import { groupStore$, groups$ } from "../stores/GroupStore";
import { images$ } from "../stores/ImageStore";
import { groupMembers$ } from "../stores/MemberStore";
import { profiles$ } from "../stores/ProfileStore";
import { useEffect } from "react";
import { AppStateStatus, AppState } from "react-native";
import { posthog } from "./Posthog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import authStore$ from "../stores/AuthStore";
import { signOut } from "./Auth";

export const clearLocalPersist = async () => {
  // // const pageItemsState$ = syncState(pageItems$);
  // // const textItemsState$ = syncState(textItems$);
  // const clearProfiles = syncState(profiles$).clearPersist();
  // const clearGroups = syncState(groups$).clearPersist();
  // const clearGroupMembers = syncState(groupMembers$).clearPersist();
  // // const imagesState$ = syncState(images$);
  // // const reactionItemsState$ = syncState(reactionItems$);
  // // const reactionTextItemsState$ = syncState(reactionTextItems$);
  // console.log("info", clearProfiles);
  // await Promise.all([clearGroupMembers, clearProfiles, clearGroups]);
  AsyncStorage.clear();
  signOut();
};
export const resyncObservables = async () => {
  console.log("resyncing observables");
  const pagesState$ = syncState(pages$);
  // const pageItemsState$ = syncState(pageItems$);
  // const textItemsState$ = syncState(textItems$);
  const profilesState$ = syncState(profiles$);
  const groupsState$ = syncState(groups$);
  const groupMembersState$ = syncState(groupMembers$);
  // const imagesState$ = syncState(images$);
  // const reactionItemsState$ = syncState(reactionItems$);
  // const reactionTextItemsState$ = syncState(reactionTextItems$);

  await Promise.all([
    pagesState$.sync(),
    // pageItemsState$.sync(),
    // textItemsState$.sync(),
    profilesState$.sync(),
    groupsState$.sync(),
    groupMembersState$.sync(),
    // imagesState$.sync(),
    // reactionItemsState$.sync(),
    // reactionTextItemsState$.sync(),
  ]);
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
