import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { styled } from "nativewind";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons"; // Assuming you're using Expo's Ionicons
import { useAuth } from "@/src/contexts/AuthProvider";
import Toast from "react-native-root-toast";

// Styled components using NativeWind
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledMotiView = styled(MotiView);

const AccountForm = () => {
  const { session, updateEmail, updatePassword } = useAuth();
  const [email, setEmail] = useState(session?.user.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  useEffect(() => {
    const isEmailChanged = email !== session?.user.email;
    const isPasswordChanged = password !== "";

    setHasChanges(isEmailChanged || (isPasswordChanged && password === confirmPassword));
  }, [email, password, confirmPassword]);
  const checkEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSave = async () => {
    // Handle save logic here
    setUpdating(true);
    if (!email) {
      Toast.show("Please fill out email, and try again", {});
      setEmail(session?.user.email);
      setUpdating(false);
      return;
    }
    const validEmail = checkEmail(email);
    if (!validEmail) {
      Toast.show("Please enter a valid email address", {});
      setUpdating(false);
      return;
    }
    if (email === session?.user.email) {
      await updateEmail(email);
    }
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      Toast.show("Passwords do not match", {});
      setUpdating(false);
      return;
    }
    if (password !== "") {
      await updatePassword(password);
    }
    Toast.show("Update Finished", {});
    setUpdating(false);
  };

  return (
    <StyledView className="w-full justify-center items-start ">
      {/* Email Field */}
      <StyledText className="text-secondary mb-2" style={{ fontFamily: "PragmaticaExtended" }}>
        EMAIL
      </StyledText>
      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
        {/* <StyledText className="text-secondary">Email</StyledText> */}
        <StyledTextInput
          value={email}
          //   editable={isEditing.email}
          placeholder="EMAIL ADDRESS"
          placeholderTextColor={"#B0B0B0"}
          onChangeText={setEmail}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
        />
      </StyledMotiView>

      {/* Password Field */}
      <StyledText className="text-secondary mb-2" style={{ fontFamily: "PragmaticaExtended" }}>
        PASSWORD
      </StyledText>
      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
        {/* <StyledText className="text-secondary">Password</StyledText> */}
        <StyledTextInput
          value={password}
          //   editable={isEditing.password}
          placeholder="PASSWORD"
          placeholderTextColor={"#B0B0B0"}
          secureTextEntry={true}
          onChangeText={setPassword}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
        />
      </StyledMotiView>
      <StyledText className="text-secondary mb-2" style={{ fontFamily: "PragmaticaExtended" }}>
        CONFIRM
      </StyledText>
      <StyledMotiView
        className="w-full mb-4 border border-gray-400 rounded-lg flex-row items-center justify-between px-4 py-3"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}>
        <StyledTextInput
          placeholder="CONFIRM PASSWORD"
          placeholderTextColor={"#B0B0B0"}
          value={confirmPassword}
          //   editable={isEditing.password}
          secureTextEntry={true}
          onChangeText={setConfirmPassword}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
        />
      </StyledMotiView>

      {/* save */}
      <StyledPressable
        onPress={handleSave}
        disabled={!hasChanges || updating}
        className={`w-full py-3 mb-2 ${
          !hasChanges || updating ? "bg-gray-400" : "bg-secondary"
        } border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          Save Changes
        </StyledText>
      </StyledPressable>
    </StyledView>
  );
};

export default AccountForm;
