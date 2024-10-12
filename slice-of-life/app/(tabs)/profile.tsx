import LogoutButton from "@/src/components/auth/LogoutButton";
import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <LogoutButton />
    </View>
  );
}
