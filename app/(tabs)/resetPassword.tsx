import ForgotPasswordForm from "@/src/components/auth/ForgotPasswordForm";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaFrameContext, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ResetPasswordForm from "@/src/components/auth/ResetPasswordForm";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);

export default function ResetPassword() {
  return (
    <StyledView className="flex-1 ">
      <StyledSafeAreaView className="flex-1 justify-center px-12">
        <StyledText className="text-secondary  text-2xl pb-4 text-center" style={{ fontFamily: "PragmaticaExtended" }}>
          RESET PASSWORD
        </StyledText>
        <ResetPasswordForm />
      </StyledSafeAreaView>
    </StyledView>
  );
}
