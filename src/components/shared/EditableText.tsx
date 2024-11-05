import authStore$ from "@/src/stores/AuthStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { Pressable, View, Text, TextInput } from "react-native";
import Toast from "react-native-root-toast";
const StyledView = styled(View);
const StyledMotiView = styled(MotiView);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledFeather = styled(Feather);
export default function EditableText({ placeholder, action }: { placeholder: string; action: (val: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(placeholder);
  const handleSubmit = () => {
    if (newValue === "") {
      Toast.show("Please enter a username to update");
      console.error("please enter username");
      return;
    }
    setIsEditing(false);
    action(newValue);
  };
  return (
    <AnimatePresence>
      {!isEditing && (
        <StyledPressable onPress={() => setIsEditing(true)} className="flex-row items-center ">
          <StyledMotiView className="flex-row justify-center items-center">
            <StyledText className="text-lg">{placeholder}</StyledText>
            <StyledFeather name="edit-2" size={12} color="black" className="p-2" />
          </StyledMotiView>
        </StyledPressable>
      )}
      {isEditing && (
        <StyledMotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -10 }}
          transition={{ type: "timing", duration: 200 }}
          className="w-full px-10">
          <StyledTextInput
            value={newValue}
            onChangeText={setNewValue}
            onSubmitEditing={handleSubmit}
            onBlur={handleSubmit}
            autoFocus
            placeholder="Enter new username"
            className="border-b border-gray-400 text-center p-2"
          />
        </StyledMotiView>
      )}
    </AnimatePresence>
  );
}
