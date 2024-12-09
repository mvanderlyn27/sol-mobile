import { observer, useMount } from "@legendapp/state/react";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import authStore$ from "@/src/stores/AuthStore";
import { View } from "moti";
import { syncState, whenReady } from "@legendapp/state";
import ProtectedLayout from "@/src/components/navigation/ProtectedRoute";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { posthog } from "@/src/services/Posthog";
import { profiles$ } from "@/src/stores/ProfileStore";
import { imagesItems$, pageItems$, pages$, textItems$ } from "@/src/stores/PagesStore";
import { images$ } from "@/src/stores/ImageStore";
import { clearLocalPersist, resyncObservables } from "@/src/services/AppStore";
import { supabase } from "@/src/lib/supabase";

export const unstable_settings = {
  initialRouteName: "home",
};

const Layout = observer(function Layout() {
  // useAppStateListener();
  useMount(async () => {
    const curId = authStore$.session.user.id.get();
    profiles$.onChange(async () => {
      const shouldResetStorage = curId && profiles$[curId].should_reset_storage.get();
      if (shouldResetStorage) {
        profiles$[curId].should_reset_storage.set(false);
        const { error } = await supabase.from("profiles").update({ should_reset_storage: false }).eq("id", curId);
        await resyncObservables();
        posthog.capture("reset-local-storage");
      }
    });
  });
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
          name="home"
          options={{
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
