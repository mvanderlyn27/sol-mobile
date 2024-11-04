import React, { useState } from "react";
import { styled } from "nativewind";
import { View, Text, TextInput, Pressable } from "react-native";
import ModalButton from "@/src/components/shared/ModalButton"; // Assuming this is a styled button
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import authStore$ from "@/src/stores/AuthStore";
import { groupMembers$ } from "@/src/stores/MemberStore";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

export default function InviteGroupMember() {
  const [username, setUsername] = useState("");
  let groupId = useLocalSearchParams().id;
  console.log(groupId);
  if (Array.isArray(groupId)) {
    groupId = groupId[0];
  }
  const handleAddUser = () => {
    if (username.trim()) {
      console.log(`Adding user: ${username}`);
      // Add user logic here
      setUsername(""); // Reset input after adding
    } else {
      console.log("Please enter a valid username or email");
    }
  };

  return (
    <StyledView className="flex-col flex-1 px-8 bg-[#F5EEE5]">
      <StyledView className="flex-row justify-center items-center p-4 pb-20">
        <StyledText className="text-lg font-bold">Edit Members</StyledText>
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
      <StyledView className="flex-row mb-4 items-center">
        <StyledTextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          placeholderTextColor="#9c9c9c"
          className="w-full p-4 border-black border-2 rounded-lg text-center bg-transparent mb-4"
        />
      </StyledView>

      {/* Add Button */}
      <StyledView className="flex-row justify-end px-16">
        <ModalButton action={handleAddUser} text="Invite" color={"bg-primary"} />
      </StyledView>
    </StyledView>
  );
}
