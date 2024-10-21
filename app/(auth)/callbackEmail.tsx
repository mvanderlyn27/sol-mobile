import ForgotPasswordForm from "@/src/components/auth/ForgotPasswordForm";
import { Link } from "expo-router";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
export default function callbackEmail() {
  return (
    <StyledView className="flex-1 justify-center">
      <StyledView className="flex-col items-center px-12 justify-center">
        <StyledText className="text-secondary  text-2xl pb-4" style={{ fontFamily: "PragmaticaExtended" }}>
          EMAIL VERIFIED
        </StyledText>
        <Link href="/login" asChild>
          <StyledPressable className="flex-1 items-center justify-center py-2">
            <StyledText className={`font-bold  text-secondary`} style={{ fontFamily: "PragmaticaExtended" }}>
              CONTINUE
            </StyledText>
          </StyledPressable>
        </Link>
      </StyledView>
    </StyledView>
  );
}
