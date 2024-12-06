import { generateId } from "@/src/stores/AsyncStorage";
import authStore$ from "@/src/stores/AuthStore";
import { addNotification } from "@/src/stores/NotificationStore";
import { profiles$, updateUsername } from "@/src/stores/ProfileStore";
import { NotificationType } from "@/src/types/shared.types";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { Pressable, View, Text, TextInput } from "react-native";

const StyledView = styled(View);
const StyledMotiView = styled(MotiView);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledFeather = styled(Feather);

export default function UsernameInput({ disabled }: { disabled?: boolean }) {
  const placeholder = profiles$[authStore$.session.user.id.peek() || ""].username.peek();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newValue, setNewValue] = useState(placeholder);

  const handleUpdateUsername = (val: string) => {
    const { error } = updateUsername(val);
    if (error) {
      addNotification({ id: generateId(), message: error, type: NotificationType.error });
      setNewValue(placeholder);
      setLoading(false);
    } else {
      setLoading(false);
      addNotification({
        id: generateId(),
        message: `Name Updated`,
        type: NotificationType.info,
      });
    }
  };

  const handleSubmit = () => {
    if (!newValue || newValue === "") {
      addNotification({
        id: generateId(),
        message: "Please enter a value to update",
        type: NotificationType.info,
      });
      return;
    }
    setIsEditing(false);
    handleUpdateUsername(newValue);
  };

  const updateValue = (value: string) => {
    // Clean the input: trim spaces and convert to lowercase
    const cleanedValue = value.trim().toLowerCase();
    setNewValue(cleanedValue);
  };

  return (
    <AnimatePresence>
      {!isEditing && (
        <StyledPressable onPress={() => setIsEditing(true)} className="flex-row items-center py-2">
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
            editable={!disabled}
            value={newValue || ""}
            onChangeText={updateValue}
            onSubmitEditing={handleSubmit}
            onBlur={handleSubmit}
            autoFocus
            autoCapitalize="none"
            placeholder="Enter new username"
            className="border-b border-gray-400 text-center p-2 text-lg"
          />
        </StyledMotiView>
      )}
    </AnimatePresence>
  );
}
