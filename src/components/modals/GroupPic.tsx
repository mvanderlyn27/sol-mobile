import { groups$ } from "@/src/stores/GroupStore";
import { Group } from "@/src/types/shared.types";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
export default function GroupPic({ editable, groupId }: { editable?: boolean; groupId?: string }) {
  let source = null;
  const [seed, setSeed] = useState<number | null>(null);
  useEffect(() => {
    setSeed(Math.random());
  }, []);
  let placeholder = null;
  if (groupId) {
    const group: Group = groups$[groupId].get();
    source = group.cover_url;
    placeholder = group.cover_placeholder;
  }
  const handleEdit = () => {
    console.log("edit");
  };
  return (
    <StyledPressable
      pointerEvents={editable ? "auto" : "none"}
      className={`rounded-md w-full aspect-auto flex-1 bg-secondary overflow-hidden`}
      onPress={editable ? handleEdit : () => {}}>
      {!groupId && <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${seed}`} />}
      {groupId && <Image style={{ flex: 1 }} source={source} placeholder={placeholder} />}
    </StyledPressable>
  );
}
