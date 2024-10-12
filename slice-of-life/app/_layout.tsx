import { Slot } from "expo-router";
import { AuthProvider } from "@/src/contexts/AuthProvider";
import { Text, View } from "react-native";
import { styled } from "nativewind";
import { RootSiblingParent } from "react-native-root-siblings";

export const StyledView = styled(View);
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootSiblingParent>
        <Slot />
      </RootSiblingParent>
    </AuthProvider>
  );
}
