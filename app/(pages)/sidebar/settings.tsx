import { View, TextInput, Pressable, Text, Image, SafeAreaView } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import ModalButton from "@/src/components/shared/ModalButton"; // Adjust this import if needed
import { styled } from "nativewind";
import { router } from "expo-router";
import { useState } from "react";
import SettingsSidebar from "@/src/components/settings/SettingsSidebar";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledFeather = styled(Feather);

export default function Settings() {
  return (
    <StyledView className="flex-col flex-1 bg-[#1E1E1E]">
      <StyledSafeAreaView className="flex-1">
        <SettingsSidebar />
      </StyledSafeAreaView>
    </StyledView>
  );
}
