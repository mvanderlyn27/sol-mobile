import React, { useState } from "react";
import { styled } from "nativewind";
import { View, Text, TextInput, Pressable, Share } from "react-native";
import ModalButton from "@/src/components/shared/ModalButton"; // Assuming this is a styled button
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import authStore$ from "@/src/stores/AuthStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { addNotification, notificationStore$ } from "@/src/stores/NotificationStore";
import { generateId } from "@/src/stores/AsyncStorage";
import { ButtonType, NotificationType } from "@/src/types/shared.types";
import { profiles$ } from "@/src/stores/ProfileStore";
import { inviteGroupMember } from "@/src/services/Group";
import * as Clipboard from "expo-clipboard";
import ModalIconButton from "@/src/components/shared/ModalIconButton";
import { Feather } from "@expo/vector-icons";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const ensureNotArray = (input: string | string[]) => {
  if (Array.isArray(input)) {
    return input[0];
  }
  return input;
};

export default function InviteGroupMember() {
  const [username, setUsername] = useState("");
  const groupId = ensureNotArray(useLocalSearchParams().id);

  const handleAddUser = () => {
    if (username.trim()) {
      if (username.indexOf(" ") !== -1) {
        addNotification({
          id: generateId(),
          message: "Usernames must be 1 word and lowercase, please try again",
          type: NotificationType.error,
        });
        console.log("Please enter a valid username");
        return;
      }
      const inviteId = inviteGroupMember(groupId, username);
      if (!inviteId) {
        console.log("Failed inviting");
        return;
      }
      addNotification({
        id: generateId(),
        message: `${username} invited!`,
        type: NotificationType.success,
      });
      setUsername(""); // Reset input after adding
    } else {
      addNotification({
        id: generateId(),
        message: "Please enter a valid username",
        type: NotificationType.error,
      });
      console.log("Please enter a valid username");
    }
  };

  const sanitizeInput = (input: string) => {
    // Ensure the input is lowercase and only take the first word
    const sanitized = input.toLowerCase();
    setUsername(sanitized);
  };
  const copyGroupId = async () => {
    if (groupId) {
      await Clipboard.setStringAsync(groupId);
      addNotification({
        id: generateId(),
        message: "Code Copied!",
        type: NotificationType.success,
      });
    }
  };
  const shareGroupId = async () => {
    if (groupId) {
      try {
        const result = await Share.share({
          message: `Join my shared journal! Group code:\n${groupId}`,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <StyledView className="flex-col flex-1 px-8 bg-[#F5EEE5]">
      <StyledView className="flex-row justify-center items-center p-4">
        <StyledText className="text-lg font-bold">Invite New Member</StyledText>
      </StyledView>
      <StyledView className="absolute left-0 z-10">
        <StyledPressable
          onPress={() => {
            console.log("Back");
            router.back();
          }}
          className="p-4">
          <AntDesign name="left" size={24} color="black" />
        </StyledPressable>
      </StyledView>
      {/* Text Input for Username */}
      <StyledView className="flex-1 flex-col justify-center items-center px-4">
        <StyledText className="w-full text-start text-lg font-bold">Share group code, or enter username:</StyledText>
        <StyledView className=" py-4">
          <StyledText selectable className=" text-xs " numberOfLines={2}>
            {groupId}
          </StyledText>
        </StyledView>
        <StyledView className="flex-row   py-4">
          <ModalIconButton action={copyGroupId} text="Copy" color={"bg-darkPrimary"} buttonType={ButtonType.Copy} />
          <ModalIconButton action={shareGroupId} text="Share" color={"bg-darkPrimary"} buttonType={ButtonType.Share} />
        </StyledView>
      </StyledView>
      <StyledView className="h-[1px] w-full bg-slate-400 my-4" />

      <StyledView className="flex-1 flex-col justify-center items-center px-4">
        <StyledTextInput
          value={username}
          autoCapitalize={"none"}
          onChangeText={sanitizeInput}
          placeholder="Enter username"
          placeholderTextColor="#9c9c9c"
          className="w-full p-4 border-black border-2 rounded-lg text-center bg-transparent mb-4"
        />

        {/* Add Button */}
        <StyledView className="flex-row px-20">
          <ModalButton action={handleAddUser} text="Invite" color={"bg-primary"} />
        </StyledView>
      </StyledView>
    </StyledView>
  );
}
