import { groups$ } from "@/src/stores/GroupStore";
import { Group } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import * as FileSystem from "expo-file-system";
import StorageService from "@/src/api/storage";
import { resizeImage } from "@/src/services/Media";
import { supabase } from "@/src/lib/supabase";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Skeleton } from "moti/skeleton";
import { AnimatePresence, MotiView } from "moti";
import { ApiService } from "@/src/services/ApiService";
import { update } from "lodash";
import { updateGroupPhoto } from "@/src/services/Group";
const StyledView = styled(MotiView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const GroupPic = observer(function GroupPic({
  editable,
  groupId,
  invitation,
}: {
  editable?: boolean;
  groupId: string;
  invitation?: boolean;
}) {
  const [seed, setSeed] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setSeed(Math.random());
  }, []);
  const handleUpdatePic = async () => {
    console.log("clicked");
    setLoading(true);
    await updateGroupPhoto(groupId);
    setLoading(false);
  };
  const group = groups$[groupId].get();
  if (!group) {
    return null;
  }

  return (
    <StyledPressable
      pointerEvents={editable && !loading ? "auto" : "none"}
      className={`rounded-lg w-full aspect-auto flex-1 bg-secondary overflow-hidden`}
      onPress={editable ? handleUpdatePic : () => {}}>
      {invitation && (
        <StyledView
          key="invitation-banner"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}
          className="absolute top-2 right-2 w-[100px] items-center justify-center rounded-full overflow-hidden z-10 bg-primary">
          <StyledText className="text-sm font-bold px-3 py-1 text-white">Invitation</StyledText>
        </StyledView>
      )}
      {loading && (
        <StyledView
          key="loading"
          className="flex-1"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}>
          <Skeleton width={"100%"} height={"100%"} />
        </StyledView>
      )}
      {!loading && !group?.cover_url && (
        <StyledView
          key="placeholder"
          className="flex-1"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}>
          <Image
            style={{ flex: 1 }}
            source={`https://api.dicebear.com/9.x/shapes/svg?backgroundColor=b6e3f4,c0aede,d1d4f9&seed=${groupId}`}
          />
        </StyledView>
      )}
      {!loading && group?.cover_url && (
        <StyledView
          key="image"
          className="flex-1"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}>
          <Image
            style={{ flex: 1 }}
            source={group?.cover_url}
            placeholder={{ blurhash: group?.cover_placeholder || "" }}
            transition={500}
          />
        </StyledView>
      )}
    </StyledPressable>
  );
});

export default GroupPic;
