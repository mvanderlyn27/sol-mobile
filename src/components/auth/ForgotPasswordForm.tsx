import React, { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { useAuth } from "../../contexts/AuthProvider";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Link, router } from "expo-router";
import { forgotPassword } from "@/src/services/Auth";
import { addNotification } from "@/src/stores/NotificationStore";
import { generateId } from "@/src/stores/AsyncStorage";
import { NotificationType } from "@/src/types/shared.types";
import authStore$ from "@/src/stores/AuthStore";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequestPasswordReset() {
    setLoading(true);
    const success = await forgotPassword(email);
    if (success) {
      addNotification({
        id: generateId(),
        type: NotificationType.info,
        message: "Password reset email sent successfully",
      });
      authStore$.resettingPassword.set(true);
      setLoading(false);
      router.navigate(`/otp?email=${email}`);
    } else {
      authStore$.resettingPassword.set(true);
      setLoading(false);
    }
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
          value={email}
          placeholder="EMAIL ADDRESS"
          placeholderTextColor="#B0B0B0"
          onChangeText={setEmail}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
        />
      </StyledMotiView>
      <StyledPressable
        onPress={handleRequestPasswordReset}
        disabled={loading}
        className={`w-full py-3 my-2 ${loading ? "bg-gray-400" : "bg-primary"}  rounded-lg`}>
        <StyledText className="text-center text-white" style={{ fontFamily: "PragmaticaExtended" }}>
          SUBMIT
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
