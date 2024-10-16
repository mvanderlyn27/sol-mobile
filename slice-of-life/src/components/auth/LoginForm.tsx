import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { useAuth } from "../../contexts/AuthProvider";
import Toast from "react-native-root-toast";
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
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, error } = useAuth();

  async function handleSignin() {
    setLoading(true);
    await signIn(email, password);

    if (error) {
      console.log("error signing in", error);
      Toast.show("Request failed to send.", {
        duration: Toast.durations.LONG,
      });
    }
    setLoading(false);
  }

  return (
    <StyledMotiView className="flex-col items-center justify-center">
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
      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between p-4"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "timing", duration: 300 }}>
        <StyledTextInput
          value={password}
          placeholder="PASSWORD"
          placeholderTextColor="#B0B0B0"
          onChangeText={setPassword}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          secureTextEntry={true}
          autoCapitalize="none"
        />
      </StyledMotiView>
      <Link
        href="/forgot-password"
        className="text-[#B0B0B0] text-xs text-center underline"
        style={{ fontFamily: "PragmaticaExtended-light" }}>
        FORGOT PASSWORD?
      </Link>
      <StyledPressable
        onPress={handleSignin}
        disabled={loading}
        className={`w-full py-3 mb-2 mt-8 ${
          loading ? "bg-gray-400" : "bg-secondary"
        } border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          LOGIN
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
