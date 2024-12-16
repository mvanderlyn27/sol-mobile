import { syncState } from "@legendapp/state";
import { pages$ } from "../stores/PagesStore";
import { reactionItems$, reactionTextItems$ } from "../stores/ReactStore";
import { groupStore$, groups$ } from "../stores/GroupStore";
import { images$ } from "../stores/ImageStore";
import { groupMembers$ } from "../stores/MemberStore";
import { profiles$ } from "../stores/ProfileStore";
import { useEffect } from "react";
import { AppStateStatus, AppState } from "react-native";
import { posthog } from "./Posthog";

export const clearLocalPersist = async () => {
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
    pagesState$.clearPersist(),
    // pageItemsState$.clearPersist(),
    // textItemsState$.clearPersist(),
    profilesState$.clearPersist(),
    groupsState$.clearPersist(),
    groupMembersState$.clearPersist(),
    // imagesState$.clearPersist(),
    // reactionItemsState$.clearPersist(),
    // reactionTextItemsState$.clearPersist(),
  ]);
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
