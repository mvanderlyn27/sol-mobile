import React, { useState } from "react";
import { Text, TextInput, Pressable, View } from "react-native";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { Link, router, useLocalSearchParams } from "expo-router";
import { forgotPassword } from "@/src/services/Auth";
import { addNotification } from "@/src/stores/NotificationStore";
import { generateId } from "@/src/stores/AsyncStorage";
import { NotificationType } from "@/src/types/shared.types";
import authStore$ from "@/src/stores/AuthStore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import OtpForm from "@/src/components/auth/OtpForm";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);
const StyledSafeAreaView = styled(SafeAreaView);

export default function OTP() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <StyledView className="flex-1 ">
      <StyledSafeAreaView className="flex-1 justify-center">
        <StyledView className="absolute left-10 top-20">
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={24} color="#E7DBCB" />
          </Pressable>
        </StyledView>
        <StyledView className="flex-col items-center px-12 justify-center">
          <StyledText className="text-secondary  text-2xl pb-4" style={{ fontFamily: "PragmaticaExtended" }}>
            ENTER ONE TIME PASSWORD
          </StyledText>
          <OtpForm email={email ?? ""} />
        </StyledView>
      </StyledSafeAreaView>
    </StyledView>
  );
}
