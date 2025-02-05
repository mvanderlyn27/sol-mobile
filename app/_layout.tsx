import { Stack } from "expo-router";
import { View } from "react-native";
import { styled } from "nativewind";
import { PostHogProvider } from "posthog-react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { getImageFromPath } from "@/src/assets/images/images";
import { MotiView } from "moti";
import { ImageBackground } from "expo-image";
import { observer, useMount } from "@legendapp/state/react";
import authStore$ from "@/src/stores/AuthStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import NotificationHolder from "@/src/components/notifications/NotificationHolder";
import * as Notifications from "expo-notifications";
import { profiles$ } from "@/src/stores/ProfileStore";
import { setupAppStateListener } from "@/src/services/AppService";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { OfflinePage } from "@/src/components/shared/OfflinePage";
import { appState$ } from "@/src/stores/AppStore";
SplashScreen.preventAutoHideAsync();
export const StyledView = styled(View);
export const StyledMotiView = styled(MotiView);
export const RootLayout = observer(function RootLayout() {
  let [loaded, error] = useFonts({
    Calibri: require("@/src/assets/fonts/Calibri.ttf"),
    "Calibri-Bold": require("@/src/assets/fonts/Calibri-bold.ttf"),
    "Calibri-Light": require("@/src/assets/fonts/Calibri-light.ttf"),
    Cour: require("@/src/assets/fonts/Cour.ttf"),
    "Exo2-Italic": require("@/src/assets/fonts/Exo2-italic.ttf"),
    Exo2: require("@/src/assets/fonts/Exo2.ttf"),
    Inkfree: require("@/src/assets/fonts/Inkfree.ttf"),
    Ocra: require("@/src/assets/fonts/Ocra.ttf"),
    "PragmaticaExtended-Bold": require("@/src/assets/fonts/PragmaticaExtended-bold.otf"),
    "PragmaticaExtended-Light": require("@/src/assets/fonts/PragmaticaExtended-light.otf"),
    PragmaticaExtended: require("@/src/assets/fonts/PragmaticaExtended.otf"),
  });
  const notificationsEnabled = profiles$[authStore$.session.user.id.get() || ""].push_enabled.get();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: notificationsEnabled,
      shouldPlaySound: notificationsEnabled,
      shouldSetBadge: notificationsEnabled,
    }),
  });
  const netInfo = useNetInfo();
  useEffect(() => {
    appState$.offline.set(!netInfo?.isConnected || false);
    // appState$.offline.set(true);
  }, [netInfo.isConnected]);
  useMount(() => {
    authStore$.init();
  });
  setupAppStateListener();
  if (!loaded && !error) {
    return null;
  }

  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0">
      <ImageBackground style={{ flex: 1 }} source={getImageFromPath("bg_03")}>
        <PostHogProvider
          apiKey={process.env.EXPO_PUBLIC_POSTHOG_API!}
          options={{
            host: "https://us.i.posthog.com",
            disabled: process.env.EXPO_PUBLIC_ENV === "development",
            enableSessionReplay: process.env.EXPO_PUBLIC_ENV !== "development",
            sessionReplayConfig: {
              maskAllImages: false,
            },
          }}
          autocapture={{
            captureTouches: true,
            captureScreens: true,
            captureLifecycleEvents: true,
            noCaptureProp: "ph-no-capture",
          }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {appState$.offline.get() ? (
              <OfflinePage />
            ) : (
              <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
            )}
          </GestureHandlerRootView>
        </PostHogProvider>
      </ImageBackground>
      <NotificationHolder />
    </StyledMotiView>
  );
});

export default RootLayout;
