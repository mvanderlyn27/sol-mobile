import Canvas2DScroller from "@/src/components/playground/pagetTest";
import PagerTest from "@/src/components/playground/pagetTest";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import { generateId } from "@/src/stores/AsyncStorage";
import { groupStore$ } from "@/src/stores/GroupStore";
import { addNotification } from "@/src/stores/NotificationStore";
import { initializePageStore, pageStore$ } from "@/src/stores/PagesStore";
import { NotificationType } from "@/src/types/shared.types";
import { beginBatch, endBatch } from "@legendapp/state";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Journal = observer(function Journal() {
  const { id, user, date } = useLocalSearchParams<{ id: string; user?: string; date?: string }>();
  // Extract parameters from URL
  useMount(() => {
    pageStore$.ready.set(false);
    beginBatch();
    groupStore$.selectedGroup.set(id);
    initializePageStore(user, date);
    endBatch();
    pageStore$.ready.set(true);
  });
  if (pageStore$.ready.get()) {
    return <Canvas2DScroller />;
  }
  return <LoadingScreen />;
});
export default Journal;
