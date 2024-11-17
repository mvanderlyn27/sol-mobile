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
import { Blurhash } from "react-native-blurhash";
import { resizeImage } from "@/src/services/Media";
import { supabase } from "@/src/lib/supabase";
import { beginBatch, endBatch } from "@legendapp/state";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Skeleton } from "moti/skeleton";
import { AnimatePresence, MotiView } from "moti";
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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setLoading(true);
      const selectedImageUri = result.assets[0].uri;
      // Resize the image to 100x100 using ImageManipulator
      const blurhash = await ImageManipulator.manipulateAsync(
        selectedImageUri,
        [{ resize: { width: 100, height: 100 } }],
        {
          compress: 0.5,
          format: ImageManipulator.SaveFormat.PNG,
        }
      )
        .then((resizedImage) => Blurhash.encode(resizedImage.uri, 4, 3))
        .then((blurhash) => blurhash)
        .catch((error) => {
          console.error("Error generating blurhash:", error);
          // Alert.alert("Error", "Failed to generate blurhash.");
          return null;
        });
      const image = await resizeImage(selectedImageUri, result.assets[0].width, result.assets[0].height)
        .then((image) => image)
        .catch((error) => {
          console.log("error optimizing image");
          return null;
        });

      if (!image || !blurhash) {
        setLoading(false);
        return;
      }
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: "base64" });
      const { success, data, error } = await StorageService.uploadFile({
        bucket: "group_covers",
        filePath: `${groupId}/cover.webp`,
        base64: base64,
        fileExtension: "webp",
        mimeType: "image/webp",
      });
      console.log("done uploading", error, data, success);
      if (error || !data) {
        console.error("error uploading", error);
        //show notif here

        setLoading(false);
        return null;
      }
      const path = supabase.storage.from("group_covers").getPublicUrl(`${groupId}/cover.webp`);
      console.log("starting last update");
      groups$[groupId].cover_url.set(path.data.publicUrl + `?t=${new Date().toISOString()}`);
      groups$[groupId].cover_placeholder.set(blurhash);
      console.log("finished update", path);
    }

    setLoading(false);
  };
  let group = null;
  group = groups$[groupId].get();
  if (!group) {
    return null;
  }

  return (
    <StyledPressable
      pointerEvents={editable && !loading ? "auto" : "none"}
      className={`rounded-md w-full aspect-auto flex-1 bg-secondary overflow-hidden`}
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
            placeholder={{ blurhash: group?.cover_placeholder }}
            transition={500}
          />
        </StyledView>
      )}
    </StyledPressable>
  );
});

export default GroupPic;
