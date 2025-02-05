import React, { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { useAuth } from "../../contexts/AuthProvider";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Link, router } from "expo-router";
import { forgotPassword, loginWithOtp } from "@/src/services/Auth";
import { addNotification } from "@/src/stores/NotificationStore";
import { generateId } from "@/src/stores/AsyncStorage";
import { NotificationType } from "@/src/types/shared.types";
import authStore$ from "@/src/stores/AuthStore";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);

export default function OtpForm({ email }: { email: string }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleOtp() {
    setLoading(true);
    const success = await loginWithOtp(email, otp);
    if (success) {
      addNotification({
        id: generateId(),
        type: NotificationType.info,
        message: "OTP successful",
      });
      setOtp("");
      setLoading(false);
      router.navigate(`/resetPassword`);
    } else {
      authStore$.resettingPassword.set(false);
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
          value={otp}
          placeholder="EMAIL ADDRESS"
          placeholderTextColor="#B0B0B0"
          onChangeText={setOtp}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
        />
      </StyledMotiView>
      <StyledPressable
        onPress={handleOtp}
        disabled={loading}
        className={`w-full py-3 my-2 ${loading ? "bg-gray-400" : "bg-secondary"} border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          SUBMIT
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
