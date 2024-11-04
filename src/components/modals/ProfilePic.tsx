import authStore$ from "@/src/stores/AuthStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Image } from "expo-image";
import { styled } from "nativewind";
import { Pressable, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/src/lib/supabase";
import StorageService from "@/src/api/storage";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Blurhash } from "react-native-blurhash";
import { useEffect, useState } from "react";
import { resizeImage } from "@/src/services/Media";
import { beginBatch, endBatch } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import { Skeleton } from "moti/skeleton";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const ProfilePic = observer(function ProfilePic({ editable, userId }: { editable?: boolean; userId?: string }) {
  const [loading, setLoading] = useState(false);
  const curUserId = userId ? userId : authStore$.session.get()?.user.id;
  if (curUserId === undefined) return null;
  const profile = profiles$[curUserId].get();
  console.log("cur profile", profile);
  const shortId = curUserId.slice(0, 8);
  const handleUpdatePic = async () => {
    console.log("clicked");

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
        bucket: "avatars",
        filePath: `${curUserId}/avatar.webp`,
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
      const path = supabase.storage.from("avatars").getPublicUrl(`${curUserId}/avatar.webp`);
      console.log("starting last update");
      beginBatch();
      console.log("user", curUserId);
      profiles$[curUserId].avatar_url.set(path.data.publicUrl + `?t=${new Date().toISOString()}`);
      profiles$[curUserId].avatar_placeholder.set(blurhash);
      endBatch();
      console.log("finished update", path);
      setLoading(false);
    }
  };
  return (
    <StyledPressable
      className="rounded-full w-full aspect-square bg-secondary overflow-hidden"
      onPress={editable ? handleUpdatePic : null}>
      {loading && <Skeleton width={"100%"} height={"100%"} />}
      {!loading && profile?.avatar_url ? (
        <Image style={{ flex: 1 }} source={profile.avatar_url} placeholder={profile.avatar_placeholder} />
      ) : (
        <Image style={{ flex: 1 }} source={`https://api.dicebear.com/9.x/miniavs/svg?seed=${shortId}`} />
      )}
    </StyledPressable>
  );
});
export default ProfilePic;
