import { observer } from "@legendapp/state/react";
import { ScrollView, View } from "react-native";
import GroupCard from "../home/GroupCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import UserPic from "../shared/UserPic";
import SettingButton from "./SettingButton";
import { router } from "expo-router";
import authStore$ from "@/src/stores/AuthStore";
const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
export default function HomeButtons() {
  const handleSettings = () => {
    console.log("settings");
    router.push("/sidebar/settings");
  };
  const handleProfile = () => {
    router.push("/modals/profile");
  };

  return (
    <StyledView className="flex-row justify-between p-4">
      <SettingButton action={handleSettings} />
      <UserPic action={handleProfile} userId={authStore$.session.get()?.user.id} />
    </StyledView>
  );
}
