import { Image } from "expo-image";
import { styled } from "nativewind";
import { Pressable, View } from "react-native";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
export default function GroupPic({
  editable,
  source,
  placeholder,
}: {
  editable?: boolean;
  source?: string | null;
  placeholder?: string | null;
}) {
  const handleEdit = () => {
    console.log("edit");
  };
  return (
    <StyledPressable
      pointerEvents={editable ? "auto" : "none"}
      className={`rounded-md w-full aspect-auto flex-1 bg-secondary overflow-hidden`}
      onPress={editable ? handleEdit : () => {}}>
      {!source && !placeholder && (
        <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${Math.random() * 3}`} />
      )}
      {(source || placeholder) && <Image style={{ flex: 1 }} source={source} placeholder={placeholder} />}
    </StyledPressable>
  );
}
