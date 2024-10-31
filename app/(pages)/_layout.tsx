import BottomBar from "@/src/components/journal/bottomBar/BottomBar";
import NavigationBar from "@/src/components/navigation/NavigationBar";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
import { Redirect, Slot, Stack } from "expo-router";

const Layout = observer(function Layout() {
  const session = authStore$.session.get();
  const loadingAuth = authStore$.loading.get();
  if (loadingAuth) return <Redirect href="/loading" />;
  if (session === null) {
    console.log("not authenticated", session);
    return <Redirect href="/login" />;
  }
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      <NavigationBar />
    </>
  );
});

export default Layout;
