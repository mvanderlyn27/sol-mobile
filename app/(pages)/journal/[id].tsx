import Canvas2DScroller from "@/src/components/playground/pagetTest";
import PagerTest from "@/src/components/playground/pagetTest";
import LoadingScreen from "@/src/components/screens/LoadingScreen";
import { groupStore$ } from "@/src/stores/GroupStore";
import { initializePageStore, pageStore$ } from "@/src/stores/PagesStore";
import { batch } from "@legendapp/state";
import { observer, useMount } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Journal = observer(function Journal() {
  const { id, user, date } = useLocalSearchParams<{ id: string; user?: string; date?: string }>();
  const ready =
    // Extract parameters from URL
    useMount(() => {
      // Ensure `id`, `user`, and `date` are strings
      groupStore$.selectedGroup.set(id);
      if (user) {
        pageStore$.initialUser.set(user);
      }
      if (date) {
        pageStore$.initialDate.set(date);
      }
      initializePageStore();
    });
  if (!pageStore$.ready.get()) {
    return <LoadingScreen />;
  }
  return <Canvas2DScroller />;
});
export default Journal;
