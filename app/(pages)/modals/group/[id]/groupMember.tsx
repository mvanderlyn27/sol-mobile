import React, { useState } from "react";
import { styled } from "nativewind";
import { View, Text, TextInput, Pressable } from "react-native";
import ModalButton from "@/src/components/shared/ModalButton"; // Assuming this is a styled button
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

export default function GroupMember() {
  return (
    <View
      //  style={{ flex: 1, backgroundColor: "#F5EEE5" }}
      style={{ flex: 1, padding: 10, backgroundColor: "#F5EEE5" }}>
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
      <Text> Profile</Text>
    </View>
  );
}
