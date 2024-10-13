import { Slot } from "expo-router";
import { AuthProvider } from "@/src/contexts/AuthProvider";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { RootSiblingParent } from "react-native-root-siblings";
import { PostHogProvider } from "posthog-react-native";

export const StyledView = styled(View);
export default function RootLayout() {
  return (
    <AuthProvider>
      <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_API!}
        options={{
          host: "https://us.i.posthog.com",
        }}>
        <RootSiblingParent>
          <Slot />
        </RootSiblingParent>
      </PostHogProvider>
    </AuthProvider>
  );
}
