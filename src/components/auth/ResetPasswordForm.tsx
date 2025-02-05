import React, { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Link, router } from "expo-router";
import { generateId } from "@/src/stores/AsyncStorage";
import { addNotification } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import { updatePassword } from "@/src/services/Auth";
import { ErrorService } from "@/src/services/ErrorService";
import authStore$ from "@/src/stores/AuthStore";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestPasswordReset() {
    setLoading(true);
    if (password === "") {
      addNotification({
        id: generateId(),
        message: "Passwords must be at least 6 characters, please try again",
        type: NotificationType.error,
      });
      setLoading(false);
    }
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      addNotification({
        id: generateId(),
        message: "Passwords do not match, please try again",
        type: NotificationType.error,
      });
    }
    const success = await updatePassword(password);
    if (success) {
      addNotification({
        id: generateId(),
        message: "Password updated",
        type: NotificationType.info,
      });
      authStore$.resettingPassword.set(false);
      router.push("/home");
    } else {
      ErrorService.handleError("Failed to update password", "failed to update password");
    }
    setLoading(false);
  }

  return (
    <StyledMotiView className="flex-col w-full items-start justify-center">
      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between p-4"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "timing", duration: 300 }}>
        <StyledTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="PASSWORD"
          placeholderTextColor="#B0B0B0"
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
          secureTextEntry={true}
        />
      </StyledMotiView>

      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between p-4"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "timing", duration: 300 }}>
        <StyledTextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="CONFIRM PASSWORD"
          placeholderTextColor="#B0B0B0"
          className="w-full  text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
          secureTextEntry={true}
        />
      </StyledMotiView>
      <StyledPressable
        onPress={handleRequestPasswordReset}
        disabled={loading}
        className={`w-full py-3 my-2 ${loading ? "bg-gray-400" : "bg-primary"} rounded-lg`}>
        <StyledText className="text-center text-white" style={{ fontFamily: "PragmaticaExtended" }}>
          SAVE PASSWORD
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
