import Canvas2DScroller from "@/src/components/playground/pagetTest";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import { initializePageStore } from "@/src/services/Page";
import { groupStore$ } from "@/src/stores/GroupStore";
import { pageStore$ } from "@/src/stores/PagesStore";
import { beginBatch, endBatch } from "@legendapp/state";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";

const Journal = observer(function Journal() {
  const { id, user, date } = useLocalSearchParams<{ id: string; user?: string; date?: string }>();
  // Extract parameters from URL
  useMount(async () => {
    beginBatch();
    pageStore$.ready.set(false);
    groupStore$.selectedGroup.set(id);
    await initializePageStore(user, date);
    endBatch();
    pageStore$.ready.set(true);
  });
  if (pageStore$.ready.get()) {
    return <Canvas2DScroller />;
  }
  return <LoadingScreen />;
});
export default Journal;
