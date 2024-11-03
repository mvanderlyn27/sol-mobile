import { Image } from "expo-image";
import { styled } from "nativewind";
import { Pressable, View, Text } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
export default function UserPic({ action, number }: { action?: () => void; number?: number }) {
  return number === undefined ? (
    <StyledPressable
      pointerEvents={action !== undefined ? "auto" : "none"}
      onPress={action}
      className="rounded-full w-[50px] aspect-square bg-secondary overflow-hidden">
      <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${Math.random() * 3}`} />
    </StyledPressable>
  ) : (
    <StyledView className="rounded-full w-[50px] aspect-square bg-secondary overflow-hidden">
      <StyledView className="flex-1 justify-center items-center">
        <StyledText>{number}+</StyledText>
      </StyledView>
    </StyledView>
  );
}
