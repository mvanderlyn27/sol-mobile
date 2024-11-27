import { observer, useMount } from "@legendapp/state/react";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import authStore$ from "@/src/stores/AuthStore";
import { View } from "moti";
import { whenReady } from "@legendapp/state";
import ProtectedLayout from "@/src/components/navigation/ProtectedRoute";

export const unstable_settings = {
  initialRouteName: "home",
};

const Layout = observer(function Layout() {
  // useAppStateListener();
  return (
    <ProtectedLayout>
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
    </ProtectedLayout>
  );
});

export default Layout;
