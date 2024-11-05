import { groups$ } from "@/src/stores/GroupStore";
import { Group } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const GroupPic = observer(function GroupPic({
  editable,
  groupId,
  invitation,
}: {
  editable?: boolean;
  groupId?: string;
  invitation?: boolean;
}) {
  const [seed, setSeed] = useState<number | null>(null);
  useEffect(() => {
    setSeed(Math.random());
  }, []);
  let group = null;
  if (groupId) {
    group = groups$[groupId].get();
    if (!group) {
      console.log("no group yet");
      return null;
    }
    const handleEdit = () => {
      console.log("edit");
    };
    if (invitation) {
      console.log("group", group);
    }
    return (
      <StyledPressable
        pointerEvents={editable ? "auto" : "none"}
        className={`rounded-md w-full aspect-auto flex-1 bg-secondary overflow-hidden`}
        onPress={editable ? handleEdit : () => {}}>
        {invitation && (
          <StyledView className="absolute top-2 right-2 w-[100px] items-center justify-center rounded-full overflow-hidden z-10 bg-primary">
            <StyledText className="text-sm font-bold px-3 py-1 text-white">Invitation</StyledText>
          </StyledView>
        )}
        {!groupId && <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${seed}`} />}
        {groupId && !group?.cover_url && (
          <Image
            style={{ flex: 1 }}
            source={`https://api.dicebear.com/9.x/shapes/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&seed=${groupId}`}
          />
        )}
        {groupId && group?.cover_url && (
          <Image style={{ flex: 1 }} source={group?.cover_url} placeholder={group?.placeholder} />
        )}
      </StyledPressable>
    );
  }
});

export default GroupPic;
