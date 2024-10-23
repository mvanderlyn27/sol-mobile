import ForgotPasswordForm from "@/src/components/auth/ForgotPasswordForm";
import RectangleButton from "@/src/components/shared/RectangleButton";
import { router } from "expo-router";
import { styled } from "nativewind";
import { Pressable, Text, View } from "react-native";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function CallbackEmail() {
  return (
    <StyledView className="flex-1 justify-center">
      <StyledView className="flex-col items-center px-12 justify-center">
        <StyledText className="text-secondary text-2xl pb-8" style={{ fontFamily: "PragmaticaExtended" }}>
          EMAIL VERIFIED
        </StyledText>
        <StyledPressable>
          <RectangleButton
            action={() => router.push("/login")}
            text="CONTINUE"
            color={"bg-secondary"}
            textColor={"text-darkPrimary"}
          />
        </StyledPressable>
      </StyledView>
    </StyledView>
  );
}
