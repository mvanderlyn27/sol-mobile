import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, TextInput, Pressable } from "react-native";
import { Button, Input } from "@rneui/themed";
import { useAuth } from "../../contexts/AuthProvider";
import Toast from "react-native-root-toast";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Ionicons } from "@expo/vector-icons";

const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, error } = useAuth();

  async function handleSignUp() {
    setLoading(true);
    await signUp(email, password, username);

    if (error) {
      let toast = Toast.show("Request failed to send.", {
        duration: Toast.durations.LONG,
      });
    }
    setLoading(false);
  }

  return (
    <StyledMotiView className="flex-col items-center justify-center">
      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
        <StyledTextInput
          value={username}
          onChangeText={setUsername}
          placeholder="YOUR NAME"
          placeholderTextColor="#B0B0B0" // Light gray for placeholder text
          className="w-full  text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
        />
      </StyledMotiView>

      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
        <StyledTextInput
          value={email}
          onChangeText={setEmail}
          placeholder="EMAIL ADDRESS"
          placeholderTextColor="#B0B0B0"
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
        />
      </StyledMotiView>

      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
        <StyledTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="PASSWORD"
          placeholderTextColor="#B0B0B0"
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
        />
      </StyledMotiView>

      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
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
        onPress={handleSignUp}
        disabled={loading}
        className={`w-full py-3 mb-2 ${loading ? "bg-gray-400" : "bg-secondary"} border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          SUBMIT
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
