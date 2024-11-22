import Canvas2DScroller from "@/src/components/playground/pagetTest";
import PagerTest from "@/src/components/playground/pagetTest";
import FtuxScreen from "@/src/components/screens/FtuxScreen";
import authStore$ from "@/src/stores/AuthStore";
import { groupStore$ } from "@/src/stores/GroupStore";
import { initializePageStore, pageStore$ } from "@/src/stores/PagesStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { observer, useMount } from "@legendapp/state/react";
import { router, useLocalSearchParams } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Ftux = observer(function Ftux() {
  useMount(() => {
    const userId = authStore$.session.user.id.get();
    if (!userId) {
      router.navigate("/login");
    }
    const newUser = profiles$[userId || ""]?.new.get();
    console.log("new user", newUser);
    if (!newUser) {
      router.navigate("/home");
    }
  });
  return <FtuxScreen />;
});
export default Ftux;
