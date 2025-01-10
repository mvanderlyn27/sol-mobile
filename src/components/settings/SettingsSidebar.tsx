import { View, TextInput, Pressable, Text, Image, SafeAreaView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ModalButton from "@/src/components/shared/ModalButton"; // Adjust this import if needed
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useState } from "react";
import AccountForm from "./AccountForm";
import LogoutButton from "../auth/LogoutButton";
import SocialButtons from "./SocialButtons";
import * as Clipboard from "expo-clipboard";
import { generateId } from "@/src/stores/AsyncStorage";
import { addNotification } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import NotificationForm from "./NotificationForm";
import { ScrollView } from "moti";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
export default function SettingsSidebar() {
  const copyEmail = async () => {
    // Clipboard.setString("support@sliceoflifeapp.com");
    await Clipboard.setStringAsync("support@sliceoflifeapp.com");
    addNotification({
      id: generateId(),
      message: "Email Copied!",
      type: NotificationType.success,
    });
  };
  return (
    <ScrollView>
      <StyledView className="flex-col flex-1 items-start px-10">
        <StyledText className="text-secondary text-xl font-bold pb-2">Account</StyledText>
        <AccountForm />
        <StyledView className="w-full my-2 h-[2px] bg-secondary" />
        <StyledText className="text-secondary text-xl font-bold pb-2">Notifications</StyledText>
        <NotificationForm />
        <StyledView className="w-full my-2 h-[2px] bg-secondary" />
        <StyledText className="text-secondary text-xl font-bold ">Help & Support</StyledText>
        <StyledText className="text-secondary text-md ">
          Email:{" "}
          <StyledPressable onPress={copyEmail}>
            <StyledText className="underline text-primary">support@sliceoflifeapp.com</StyledText>
          </StyledPressable>
        </StyledText>
        <StyledView className="w-full my-2 h-[2px] bg-secondary" />
        <StyledText className="text-secondary text-xl font-bold ">Socials</StyledText>
        <SocialButtons />
        <StyledView className="w-full my-2 h-[2px] bg-secondary" />
        <StyledView className="flex-row py-4">
          <LogoutButton />
        </StyledView>
      </StyledView>
    </ScrollView>
  );
}
