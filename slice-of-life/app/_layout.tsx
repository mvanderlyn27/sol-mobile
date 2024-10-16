import { Slot } from "expo-router";
import { AuthProvider } from "@/src/contexts/AuthProvider";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { RootSiblingParent } from "react-native-root-siblings";
import { PostHogProvider } from "posthog-react-native";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
SplashScreen.preventAutoHideAsync();
export const StyledView = styled(View);
export default function RootLayout() {
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
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  if (!loaded && !error) {
    return null;
  }
  return (
    <AuthProvider>
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_API!}
        options={{
          host: "https://us.i.posthog.com",
        }}>
        <RootSiblingParent>
          {/* maybe add stack here for navigation? xD */}
          <Slot />
        </RootSiblingParent>
      </PostHogProvider>
    </AuthProvider>
  );
}
