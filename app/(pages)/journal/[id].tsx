import Canvas2DScroller from "@/src/components/playground/pagetTest";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import { resyncObservables } from "@/src/services/AppStore";
import { initializePageStore, useInitializePageRealtimeUpdates } from "@/src/services/Page";
import { initializeReactStore, useInitializeReactRealtimeListeners } from "@/src/services/Reaction";
import { groupStore$ } from "@/src/stores/GroupStore";
import { pageStore$, pages$ } from "@/src/stores/PagesStore";
import { reactStore$ } from "@/src/stores/ReactStore";
import { beginBatch, endBatch, syncState } from "@legendapp/state";
import { observer, useMount, useMountOnce } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";

const Journal = observer(function Journal() {
  const { id, user, date } = useLocalSearchParams<{ id: string; user?: string; date?: string }>();
  // Extract parameters from URL
  // useInitializePageRealtimeUpdates();
  // useInitializeReactRealtimeListeners();
  useMount(async () => {
    pageStore$.ready.set(false);
    groupStore$.selectedGroup.set(id);
    await resyncObservables();
    await initializePageStore(user, date);
    await syncState(reactStore$).sync();
    pageStore$.ready.set(true);
  });
  if (pageStore$.ready.get()) {
    return <Canvas2DScroller />;
  }
  return <LoadingScreen />;
});
export default Journal;
