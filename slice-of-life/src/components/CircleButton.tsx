import { useAuth } from "@/src/contexts/AuthProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { MotiView } from "moti";
import { Text } from "react-native";
import { styled } from "nativewind";
// import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ButtonType } from "@/src/types/shared.types";
//<FontAwesome name="book" size={24} color="black" />
const buttonHeight = 50; // Height for each button
const spacing = 10; // Space between buttons
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledIon = styled(Ionicons);

export default function RoundButton({
  onClick,
  buttonType,
}: {
  onClick: () => void;
  buttonType: ButtonType;
}): JSX.Element {
  const router = useRouter();

  return (
    <StyledMotiView
      className="absolute left-10 bottom-20 w-[70] h-[70] rounded-full bg-darkPrimary flex-col items-center justify-center"
      from={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "timing",
        duration: 500,
      }}>
      {/* <StyledText className="text-center text-secondary text-[20px]">Test</StyledText> */}
      <StyledIon className="text-center text-secondary" name="menu" size={50} />
    </StyledMotiView>
  );
}
