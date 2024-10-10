import { Slot } from "expo-router";
import { AuthProvider } from "@/src/contexts/AuthProvider";
import { Text, View } from "react-native";
import { styled } from "nativewind";

export const StyledView = styled(View);
export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </AuthProvider>
  );
}
