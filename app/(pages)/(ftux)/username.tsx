import FtuxScreen from "@/src/components/screens/FtuxScreen";
import authStore$ from "@/src/stores/AuthStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { observer, useMount } from "@legendapp/state/react";
import { router } from "expo-router";

const Ftux = observer(function Ftux() {
  useMount(() => {
    const userId = authStore$.session.user.id.get();
    if (!userId) {
      router.navigate("/login");
    }
    const newUser = profiles$[userId || ""]?.new.get();
    if (!newUser) {
      router.navigate("/home");
    }
    const hasUsername = profiles$[userId || ""]?.username.get();
    if (hasUsername) {
      router.navigate("/permissions");
    }
  });
  return <FtuxScreen />;
});
export default Ftux;
