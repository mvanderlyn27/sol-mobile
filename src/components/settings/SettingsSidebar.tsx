import { View, TextInput, Pressable, Text, Image, SafeAreaView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ModalButton from "@/src/components/shared/ModalButton"; // Adjust this import if needed
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useState } from "react";
import AccountForm from "./AccountForm";
import LogoutButton from "../auth/LogoutButton";
import SocialButtons from "./SocialButtons";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
export default function SettingsSidebar() {
  return (
    <StyledView className="flex-col flex-1 items-start pt- px-10">
      <StyledText className="text-secondary text-xl font-bold py-4">Settings</StyledText>
      <AccountForm />
      <LogoutButton />
      <StyledView className="w-full my-4 h-[2px] bg-secondary" />
      <StyledText className="text-secondary text-xl font-bold py-4">Help & Support</StyledText>
      <StyledText className="text-secondary text-md ">
        For questions, reach out to support@sliceoflifeapp.com
      </StyledText>
      <StyledView className="w-full my-4 h-[2px] bg-secondary" />
      <StyledText className="text-secondary text-xl font-bold py-4">About</StyledText>
      <StyledText className="text-secondary text-md ">
        Thanks for testing out the beta of the Slice of Life App! For latest updates, follow our socials:
      </StyledText>
      <SocialButtons />
      <StyledView className="flex-row py-4"></StyledView>
    </StyledView>
  );
}
