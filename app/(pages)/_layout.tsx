import BottomBar from "@/src/components/journal/journalMenu/JournalMenu";
import NavigationBar from "@/src/components/navigation/NavigationBar";
import AppOverlays from "@/src/components/screens/AppOverlays";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
import { Redirect, Slot, Stack, router } from "expo-router";

const Layout = observer(function Layout() {
  const session = authStore$.session.get();
  const loadingAuth = authStore$.loading.get();
  if (!session && !loadingAuth) {
    router.push("/login");
  }
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      {/* <AppOverlays /> */}
    </>
  );
});

export default Layout;
