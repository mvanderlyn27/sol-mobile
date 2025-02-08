import { useAuth } from "@/src/contexts/AuthProvider";
import { Alert, Button } from "react-native";
import { styled } from "nativewind";
import { Text, Pressable } from "react-native";
import authStore$ from "@/src/stores/AuthStore";
import { observer } from "@legendapp/state/react";
import { router } from "expo-router";
import { deleteAccount } from "@/src/services/Auth";
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const DeleteButton = observer(function DeleteButton() {
  const handleDelete = () => {
    deleteAccount();
  };
  const confirmDelete = () => {
    Alert.alert("Confirm Delete Account", "This is permanent :o", [
      { text: "Delete", onPress: handleDelete, style: "destructive" },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };
  return (
    <StyledPressable onPress={confirmDelete} className="w-full py-3 mb-2 bg-red-500 rounded-lg">
      <StyledText className="text-center text-white" style={{ fontFamily: "PragmaticaExtended" }}>
        Delete
      </StyledText>
    </StyledPressable>
  );
});

export default DeleteButton;
