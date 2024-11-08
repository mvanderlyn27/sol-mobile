import BottomBar from "@/src/components/journal/journalMenu/JournalMenu";
import NavigationBar from "@/src/components/navigation/NavigationBar";
import AppOverlays from "@/src/components/screens/AppOverlays";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
import { Redirect, Slot, Stack, router } from "expo-router";
import { useEffect } from "react";
export const unstable_settings = {
  initialRouteName: "home",
};
const Layout = observer(function Layout() {
  const session = authStore$.session.get();
  const loadingAuth = authStore$.loading.get();
  useEffect(() => {
    if (!session && !loadingAuth) {
      router.push("/login");
    }
  }, [session, loadingAuth]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen
          name="modals"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="sidebar"
          options={{
            presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="journal/[id]"
          options={{
            animation: "slide_from_left",
            headerShown: false,
          }}
        />
      </Stack>
      {/* <AppOverlays /> */}
    </>
  );
});

export default Layout;
