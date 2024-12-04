import PermissionsScreen from "@/src/components/screens/PermissionsScreen";
import authStore$ from "@/src/stores/AuthStore";
import { observer, useMount } from "@legendapp/state/react";
import { router } from "expo-router";

const Permissions = observer(function Permissions() {
  useMount(() => {
    const userId = authStore$.session.user.id.get();
    if (!userId) {
      router.navigate("/login");
    }
  });
  return <PermissionsScreen />;
});
export default Permissions;
