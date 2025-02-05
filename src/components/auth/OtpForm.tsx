import React, { useEffect, useState } from "react";
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
import { OtpInput } from "react-native-otp-entry";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);

export default function OtpForm({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  async function resendOtp() {
    if (!canResend) {
      addNotification({
        id: generateId(),
        type: NotificationType.info,
        message: `Please wait ${resendCooldown} seconds before resending the code.`,
      });
      return;
    }

    const success = await forgotPassword(email);
    if (success) {
      addNotification({
        id: generateId(),
        type: NotificationType.info,
        message: "OTP sent to your registered Email",
      });
      setCanResend(false);
      setResendCooldown(5); // Set cooldown to 5 seconds
    }
  }

  async function handleOtp(otp: string) {
    setLoading(true);
    console.log("otp: ", otp);
    const success = await loginWithOtp(email, otp);
    if (success) {
      addNotification({
        id: generateId(),
        type: NotificationType.info,
        message: "OTP successful",
      });
      setLoading(false);
      router.navigate(`/resetPassword`);
    } else {
      //   authStore$.resettingPassword.set(false);
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
        <OtpInput
          focusColor={"#e7dbcb"}
          numberOfDigits={6}
          type={"numeric"}
          placeholder="******"
          theme={{
            containerStyle: { borderWidth: 0 },
            placeholderTextStyle: { color: "#B0B0B0" },
            pinCodeTextStyle: { fontFamily: "PragmaticaExtended-light", color: "#e7dbcb" },
          }}
          onFilled={(text) => {
            handleOtp(text);
          }}
        />
      </StyledMotiView>

      <StyledPressable
        onPress={resendOtp}
        disabled={!canResend || loading}
        className={`w-full py-3 my-2 ${
          !canResend || loading ? "bg-gray-400" : "bg-secondary"
        } border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          {canResend ? "RESEND CODE" : `RESEND IN ${resendCooldown}s`}
        </StyledText>
      </StyledPressable>
    </StyledMotiView>
  );
}
