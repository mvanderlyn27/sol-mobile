import authStore$ from "@/src/stores/AuthStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { Pressable } from "react-native";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/src/lib/supabase";
import StorageService from "@/src/api/storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Blurhash } from "react-native-blurhash";
import { useEffect, useState } from "react";
import { resizeImage } from "@/src/services/Media";
import { observer } from "@legendapp/state/react";
import { Skeleton } from "moti/skeleton";
import { AnimatePresence, MotiView } from "moti";
import { setProfilePic } from "@/src/services/Profile";
const StyledView = styled(MotiView);
const StyledPressable = styled(Pressable);
const ProfilePic = observer(function ProfilePic({ editable, userId }: { editable?: boolean; userId: string }) {
  const [loading, setLoading] = useState(false);
  if (userId === undefined) return null;
  const profile = profiles$[userId].get();
  console.log("cur profile", profile);
  const shortId = userId.slice(0, 8);
  const handleUpdatePic = async () => {
    setLoading(true);
    await setProfilePic(userId);
    setLoading(false);
  };
  return (
    <StyledPressable
      className="rounded-full w-full aspect-square bg-secondary overflow-hidden"
      onPress={editable ? handleUpdatePic : null}>
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
      {!loading && profile?.avatar_url && (
        <StyledView
          key="image"
          className="flex-1"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}>
          <Image
            style={{ flex: 1 }}
            source={profile.avatar_url}
            placeholder={{ blurhash: profile.avatar_placeholder || "" }}
          />
        </StyledView>
      )}
      {!loading && !profile?.avatar_url && (
        <StyledView
          key="loading"
          className="flex-1"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 350 }}>
          <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${shortId}`} />
        </StyledView>
      )}
    </StyledPressable>
  );
});
export default ProfilePic;
