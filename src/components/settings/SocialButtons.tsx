import { ButtonType, IconType } from "@/src/types/shared.types";
import { View, TextInput, Pressable, Text, Image, SafeAreaView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ModalButton from "@/src/components/shared/ModalButton"; // Adjust this import if needed
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useState } from "react";
import AccountForm from "./AccountForm";
import LogoutButton from "../auth/LogoutButton";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Feather from "@expo/vector-icons/Feather";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const openInstagram = () => {};
const openTwitter = () => {};
const openTiktok = () => {};
export default function SocialButtons() {
  return (
    <StyledView className="flex-row justify-center my-4  w-full h-[40px]">
      <SocialButton type={IconType.Instagram} action={openInstagram} />
      <SocialButton type={IconType.Twitter} action={openTwitter} />
      <SocialButton type={IconType.Tiktok} action={openTiktok} />
    </StyledView>
  );
}
const SocialButton = ({ type, action }: { type: IconType; action: () => void }) => {
  const getIcon = () => {
    switch (type) {
      case IconType.Instagram:
        return <AntDesign name="instagram" size={24} color="black" />;
      case IconType.Twitter:
        return <Feather name="twitter" size={24} color="black" />;
      case IconType.Facebook:
        return <Feather name="facebook" size={24} color="black" />;
      case IconType.Tiktok:
        return <FontAwesome5 name="tiktok" size={24} color="black" />;
    }
  };
  return (
    <StyledView className=" mx-2 w-[40px] aspec-square rounded-full items-center justify-center bg-secondary">
      {getIcon()}
    </StyledView>
  );
};
