import { observer, useMount } from "@legendapp/state/react";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import authStore$ from "@/src/stores/AuthStore";
import { checkPushNotificationPermission, profiles$ } from "@/src/stores/ProfileStore";
import { View } from "moti";
import { whenReady } from "@legendapp/state";

export const unstable_settings = {
  initialRouteName: "home",
};

const Layout = observer(function Layout() {
  const session = authStore$.session.get();
  const loadingAuth = authStore$.loading.get();

  // Redirect user based on their session or profile state
  useMount(() => {
    //checks for push notifications after profiles is ready
    whenReady(profiles$, () => checkPushNotificationPermission());
  });
  useEffect(() => {
    if (!session) {
      router.navigate("/login");
    }
  }, [session, loadingAuth]);

  // Show a simple loading state until everything is resolved
  if (loadingAuth || session === undefined) {
    return null; // Or replace with a loading spinner/UI
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="modals"
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="sidebar"
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="journal/[id]"
        options={{
          animation: "slide_from_left",
        }}
      />
      <Stack.Screen
        name="(ftux)/username"
        options={{
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="(ftux)/permissions"
        options={{
          animation: "fade",
        }}
      />
    </Stack>
  );
});

export default Layout;
