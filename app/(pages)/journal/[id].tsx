import Canvas2DScroller from "@/src/components/playground/pagetTest";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import { resyncObservables } from "@/src/services/AppStore";
import { initializePageStore, useInitializePageRealtimeUpdates } from "@/src/services/Page";
import { initializeReactStore, useInitializeReactRealtimeListeners } from "@/src/services/Reaction";
import { RealtimeService } from "@/src/services/RealtimeService";
import { StoreService } from "@/src/services/StoreService";
import { SyncService } from "@/src/services/SyncService";
import { groupStore$ } from "@/src/stores/GroupStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { pageStore$, pages$ } from "@/src/stores/PagesStore";
import { reactStore$ } from "@/src/stores/ReactStore";
import { beginBatch, endBatch, syncState, when } from "@legendapp/state";
import { observer, useMount, useMountOnce } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

const Journal = observer(function Journal() {
  const { id, user, date } = useLocalSearchParams<{ id: string; user?: string; date?: string }>();
  // Extract parameters from URL
  const initJournal = async () => {
    pageStore$.ready.set(false);
    groupStore$.selectedGroup.set(id);
    await resyncObservables();
    await initializePageStore(user, date);
    pageStore$.ready.set(true);
  };
  useEffect(() => {
    initJournal();
    const cleanupReconnection = RealtimeService.initWithReconnection(() => {
      RealtimeService.unsubscribeAll();
      RealtimeService.subscribeToTable("pages", (payload) => {
        StoreService.updateStore("pages", payload.new);
      });
      RealtimeService.subscribeToTable("reactions", (payload) => {
        StoreService.updateStore("reactions", payload.new);
      });
    });

    // Cleanup subscriptions and listeners on unmount
    return () => {
      RealtimeService.unsubscribeAll();
      cleanupReconnection();
    };
  }, []);
  if (pageStore$.ready.get()) {
    return <Canvas2DScroller />;
  }
  return <LoadingScreen />;
});
export default Journal;
