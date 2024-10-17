import React, { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { useAuth } from "../../contexts/AuthProvider";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Link } from "expo-router";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendResetPasswordEmail } = useAuth();

  async function handleRequestPasswordReset() {
    setLoading(true);
    await sendResetPasswordEmail(email);
    setEmail("");
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
        className={`w-full py-3 my-2 ${loading ? "bg-gray-400" : "bg-secondary"} border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          SUBMIT
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
