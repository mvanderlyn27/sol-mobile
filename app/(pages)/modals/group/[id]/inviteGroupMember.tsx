import React, { useState } from "react";
import { styled } from "nativewind";
import { View, Text, TextInput, Pressable } from "react-native";
import ModalButton from "@/src/components/shared/ModalButton"; // Assuming this is a styled button
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import authStore$ from "@/src/stores/AuthStore";
import { groupMembers$, inviteGroupMember } from "@/src/stores/MemberStore";
import Toast from "react-native-root-toast";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
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
      // Add user logic here
      const inviteId = inviteGroupMember(groupId, username);
      if (!inviteId) {
        console.log("failed inviting");
      }
      Toast.show(`Invited ${username}`);
      setUsername(""); // Reset input after adding
    } else {
      console.log("Please enter a valid username or email");
    }
  };

  return (
    <StyledView className="flex-col flex-1 px-8 bg-[#F5EEE5]">
      <StyledView className="flex-row justify-center items-center p-4 pb-20">
        <StyledText className="text-lg font-bold">Invite New Member</StyledText>
      </StyledView>
      <StyledView className="absolute left-0 z-10">
        <StyledPressable
          onPress={() => {
            console.log("back");
            router.back();
          }}
          className="p-4 ">
          <AntDesign name="left" size={24} color="black" />
        </StyledPressable>
      </StyledView>
      {/* Text Input for Username or Email */}
      <StyledView className="flex-row mb-4 items-center px-4">
        <StyledTextInput
          value={username}
          autoCapitalize={"none"}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor="#9c9c9c"
          className="w-full p-4 border-black border-2 rounded-lg text-center bg-transparent mb-4"
        />
      </StyledView>

      {/* Add Button */}
      <StyledView className="flex-row justify-end px-20">
        <ModalButton action={handleAddUser} text="Invite" color={"bg-primary"} />
      </StyledView>
    </StyledView>
  );
}
