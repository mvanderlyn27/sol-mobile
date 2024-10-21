import ForgotPasswordForm from "@/src/components/auth/ForgotPasswordForm";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaFrameContext, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
export default function ForgotPassword() {
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
            SEND RESET EMAIL
          </StyledText>
          <ForgotPasswordForm />
        </StyledView>
      </StyledSafeAreaView>
    </StyledView>
  );
}
