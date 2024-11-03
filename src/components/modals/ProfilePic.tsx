import { Image } from "expo-image";
import { styled } from "nativewind";
import { Pressable, View } from "react-native";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
export default function ProfilePic() {
  return (
    <StyledPressable className="rounded-full w-full aspect-square bg-secondary overflow-hidden">
      <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${Math.random() * 3}`} />
    </StyledPressable>
  );
}
