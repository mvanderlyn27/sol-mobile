import React, { useState } from "react";
import { Text, TextInput, Pressable } from "react-native";
import { useAuth } from "../../contexts/AuthProvider";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Link, router } from "expo-router";
import Toast from "react-native-root-toast";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();

  async function handleRequestPasswordReset() {
    setLoading(true);
    if (password === "") {
      Toast.show("Passwords must be at least 6 characters, please try again", {});
      setLoading(false);
    }
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      Toast.show("Passwords do not match, please try again", {});
    }
    await updatePassword(password);
    Toast.show("Passwords Updated", { duration: 3000 });
    setLoading(false);
    router.push("/journal");
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
        className={`w-full py-3 my-2 ${loading ? "bg-gray-400" : "bg-secondary"} border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          SUBMIT
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
