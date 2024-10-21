import ProfileScreen from "@/src/components/screens/ProfileScreen";
import { ProfileProvider } from "@/src/contexts/ProfileProvider";
import { Link } from "expo-router";
import { Text, Pressable, View } from "react-native";

export default function Profile() {
  return (
    <ProfileProvider>
      <ProfileScreen />
    </ProfileProvider>
  );
}
