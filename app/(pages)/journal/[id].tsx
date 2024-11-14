import Canvas2DScroller from "@/src/components/playground/pagetTest";
import PagerTest from "@/src/components/playground/pagetTest";
import { groupStore$ } from "@/src/stores/GroupStore";
import { initializePageStore, pageStore$ } from "@/src/stores/PagesStore";
import { observer } from "@legendapp/state/react";
import { useLocalSearchParams } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Journal = observer(function Journal() {
  const ensureNotArray = (input: string | string[]) => {
    if (Array.isArray(input)) {
      return input[0];
    }
    return input;
  };
  const groupId = ensureNotArray(useLocalSearchParams().id);
  groupStore$.selectedGroup.set(groupId);
  initializePageStore();
  console.log("group Id", groupId);
  return <Canvas2DScroller />;
});
export default Journal;
