import { Pressable, Text } from "react-native";
import { styled } from "nativewind";
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export default function OverlayTextButton({
  text,
  bold,
  onPress,
}: {
  text: string;
  bold?: boolean;
  onPress: () => void;
}) {
  return (
    <StyledPressable className="" onPress={onPress}>
      <StyledText className={`text-white ${bold ? "font-bold" : ""}`}>{text}</StyledText>
    </StyledPressable>
  );
}
