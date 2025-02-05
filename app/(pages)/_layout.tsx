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
import { clearLocalPersist, resyncObservables } from "@/src/services/AppStore";
import { supabase } from "@/src/lib/supabase";
import { RealtimeService } from "@/src/services/RealtimeService";
import { StoreService } from "@/src/services/StoreService";

export const unstable_settings = {
  initialRouteName: "home",
};

const Layout = observer(function Layout() {
  useEffect(() => {
    const cleanupReconnection = RealtimeService.initWithReconnection(() => {
      RealtimeService.unsubscribeAll();
      RealtimeService.subscribeToTable("profiles", (payload) => {
        console.log("realtime profile update");
        if (payload.eventType === "DELETE") {
          StoreService.removeStore("profiles", payload.old.id);
        } else {
          StoreService.updateStore("profiles", payload.new);
        }
      });
      RealtimeService.subscribeToTable("groups", (payload) => {
        console.log("realtime group update");
        if (payload.eventType === "DELETE") {
          StoreService.removeStore("groups", payload.old.id);
        } else {
          StoreService.updateStore("groups", payload.new);
        }
      });
      RealtimeService.subscribeToTable("group_members", (payload) => {
        console.log("realtime group member update");
        if (payload.eventType === "DELETE") {
          StoreService.removeStore("group_members", payload.old.id);
        } else {
          StoreService.updateStore("group_members", payload.new);
        }
      });
    });

    // Cleanup subscriptions and listeners on unmount
    return () => {
      RealtimeService.unsubscribeAll();
      cleanupReconnection();
    };
  }, []);
  useMount(async () => {
    const curId = authStore$.session.user.id.get();
    profiles$.onChange(async () => {
      const shouldResetStorage = curId && profiles$[curId].should_reset_storage.get();
      const shouldClearStorage = curId && profiles$[curId].should_clear_storage.get();
      if (shouldResetStorage) {
        profiles$[curId].should_reset_storage.set(false);
        const { error } = await supabase.from("profiles").update({ should_reset_storage: false }).eq("id", curId);
        await resyncObservables();
        posthog.capture("reset-local-storage");
        console.log("reset local persist");
      }
      if (shouldClearStorage) {
        profiles$[curId].should_reset_storage.set(false);
        const { error } = await supabase.from("profiles").update({ should_clear_storage: false }).eq("id", curId);
        posthog.capture("reset-local-storage");
        console.log("reset local persist");
        await clearLocalPersist();
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
