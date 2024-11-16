import { observer } from "@legendapp/state/react";
import { ScrollView, View, Text } from "react-native";
import GroupCard from "../home/GroupCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import UserPic from "../shared/UserPic";
import SettingButton from "./SettingButton";
import { router } from "expo-router";
import authStore$ from "@/src/stores/AuthStore";
import ModalButton from "../shared/ModalButton";
const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
export default function HomeButtons() {
  const handleSettings = () => {
    console.log("settings");
    router.push("/sidebar/settings");
  };
  const handleProfile = () => {
    router.push("/modals/profile");
  };

  return (
    <StyledView className="flex-row justify-between items-center p-4">
      <SettingButton action={handleSettings} />
      <StyledText
        className="text-4xl tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended" }}>
        Library
      </StyledText>
      <UserPic action={handleProfile} userId={authStore$.session.get()?.user.id} />
    </StyledView>
  );
}
