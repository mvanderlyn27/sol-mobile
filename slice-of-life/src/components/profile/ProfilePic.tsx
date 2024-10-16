import { useData } from "@/src/contexts/DataProvider";
import { getImageFromPath } from "@/src/assets/images/images";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasFrame } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Dimensions } from "react-native";
import { Image } from "expo-image";
import BottomDrawer, { BottomDrawerMethods } from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/src/contexts/AuthProvider";
import * as FileSystem from "expo-file-system";
import MaskedView from "@react-native-masked-view/masked-view";
import { Skeleton } from "moti/skeleton";
import { BlurView } from "expo-blur";
import * as ImageManipulator from "expo-image-manipulator";
import RectangleButton from "../shared/RectangleButton";
import StorageService from "@/src/api/storage";
import Toast from "react-native-root-toast";
import Drawer from "../shared/Drawer";
import { useNav } from "@/src/contexts/NavigationProvider";
import { useProfile } from "@/src/contexts/ProfileProvider";

const StyledMotiView = styled(MotiView);
const StyledBottomDrawer = styled(BottomDrawer);
const StyledText = styled(Text);
const StyledIon = styled(Ionicons);
const StyledMaskedView = styled(MaskedView);
const StyledPressable = styled(Pressable);
const StyledImage = styled(Image);
const StyledBlurView = styled(BlurView);
const StyledSkeleton = styled(Skeleton);
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const imageSize = screenWidth * 0.7; // 70% of the screen width

export default function ProfilePic() {
  const { session } = useAuth();
  const { setNavMenuVisible } = useNav();
  const { setProfileMenuVisible } = useProfile();
  const { profile, updateProfile, removeProfilePicture } = useData();
  const [editMode, setEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showBottomDrawer, setShowBottomDrawer] = useState(false);
  const startEdit = () => {
    setEditMode(true);
    setNavMenuVisible(false);
    setProfileMenuVisible(false);
  };
  const endEdit = () => {
    setEditMode(false);
    setNavMenuVisible(true);
    setProfileMenuVisible(true);
  };
  const resizeImage = async (uri: string, originalWidth: number, originalHeight: number) => {
    //ensure image is max the size of the screen
    // Get screen dimensions

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = Math.min(screenWidth, originalWidth); // Set a max width (80% of screen width)
    let newHeight = newWidth / aspectRatio; // Calculate height based on aspect ratio

    // If the calculated height exceeds the screen height, adjust
    if (newHeight < screenHeight && originalHeight > screenHeight) {
      newHeight = screenHeight;
      newWidth = newHeight * aspectRatio; // Recalculate width based on new height
    }

    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: Math.round(newWidth), height: Math.round(newHeight) } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP }
    );

    return manipResult;
  };

  const handleAddPhoto = async () => {
    if (!session) {
      console.debug("not logged in");
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    // Save image if not cancelled
    if (!result.canceled) {
      setUploadingImage(true);
      const img = result.assets[0];
      const resizedImage = await resizeImage(img.uri, img.width, img.height);
      const fullFileName = img.uri.split("/").pop();
      const fileName = fullFileName?.substring(0, fullFileName.lastIndexOf(".")) || fullFileName; // File name without extension
      const fileExtension = fullFileName?.split(".").pop(); // File extension
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: "base64" });
      console.log("file type", fullFileName);

      const filePath = `/${session.user.id}/avatar.webp`;
      await updateProfile({ file: { bucket: "avatars", filePath: filePath, base64: base64, fileExtension: "webp" } });
      setUploadingImage(false);
    }
  };
  const handleDone = () => {
    endEdit();
  };
  const startDelete = () => {
    setShowBottomDrawer(true);
  };
  const handleDelete = async () => {
    if (profile?.avatar_url) {
      setUploadingImage(true);
      await removeProfilePicture();
    }
    setUploadingImage(false);
    Toast.show("Deleted", {});
    setShowBottomDrawer(false);
    // setEditMode(false);
  };
  return !editMode ? (
    <StyledMotiView style={{ width: imageSize, height: imageSize }} className="bg-secondary rounded-lg overflow-hidden">
      <StyledPressable onPress={startEdit} className="flex-1">
        <StyledImage
          source={profile?.avatar_url ? profile?.avatar_url : getImageFromPath("default_avatar")}
          content-fit="cover"
          className="flex-1"
        />
      </StyledPressable>
    </StyledMotiView>
  ) : (
    <StyledBlurView className="absolute top-0 bottom-0 right-0 left-0 bg-black/50 z-10" intensity={50}>
      {/* Centered image */}
      <StyledMotiView className="flex-1 flex-col justify-center items-center">
        <StyledMotiView className="flex-col items-center justify-center  ">
          {/* <Image
          source={{ uri: item.path }} // Replace with your image URL or source
          style={{ width: maxFrameWidth, height: maxFrameWidth / aspectRatio, borderRadius: 10 }}
        /> */}
          <StyledMotiView
            style={{ width: imageSize, height: imageSize }}
            className="bg-secondary rounded-lg overflow-hidden">
            <StyledPressable onPress={() => setEditMode(true)} className="flex-1">
              {uploadingImage ? (
                <StyledSkeleton width={imageSize} height={imageSize} />
              ) : (
                <StyledImage
                  source={profile?.avatar_url ? profile?.avatar_url : getImageFromPath("default_avatar")}
                  content-fit="cover"
                  className="flex-1"
                />
              )}
            </StyledPressable>
          </StyledMotiView>
          <AnimatePresence exitBeforeEnter>
            {!uploadingImage && (
              <StyledMotiView
                key="buttons"
                className="flex p-4 flex-row justify-center items-center"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 200 }}>
                {!profile?.avatar_url && (
                  <RectangleButton text="Add Photo" color="bg-primary" textColor="text-white" action={handleAddPhoto} />
                )}
                {profile?.avatar_url && (
                  <RectangleButton
                    text="Update"
                    color="bg-secondary"
                    textColor="text-darkPrimary"
                    action={handleAddPhoto}
                  />
                )}
              </StyledMotiView>
            )}
            {uploadingImage && (
              <StyledMotiView
                key="uploading-notif"
                className={`flex p-4 flex-row justify-center items-center`}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 200 }}>
                <StyledMotiView
                  className={`bg-slate-200 px-7 py-3 rounded-full shadow-md flex justify-center items-center`}>
                  <StyledText className={`text-darkPrimary text-lg font-bold`}>Uploading...</StyledText>
                </StyledMotiView>
              </StyledMotiView>
            )}
          </AnimatePresence>
        </StyledMotiView>
      </StyledMotiView>

      <StyledMotiView className="absolute top-16  left-8">
        <StyledPressable onPress={startDelete} className="bg-clear px-4 py-2 rounded-md">
          <StyledIon name="trash-outline" size={30} className="text-red-500" />
        </StyledPressable>
      </StyledMotiView>

      {/* Button at the bottom */}
      <AnimatePresence>
        {uploadingImage ? null : (
          <StyledMotiView
            className="absolute top-16  right-8"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 500 }}>
            <StyledPressable onPress={uploadingImage ? null : handleDone} className="bg-clear px-4 py-2 rounded-md">
              <StyledText className={`text-white text-lg`}>Done</StyledText>
            </StyledPressable>
          </StyledMotiView>
        )}
      </AnimatePresence>
      {showBottomDrawer && (
        <Drawer
          onClose={() => setShowBottomDrawer(false)}
          key="edit-frame-bottom-drawer"
          text={"Are you sure you want to delete your profile picture?"}
          buttons={[{ action: handleDelete, text: "Yep, Delete it!", color: "bg-red-500" }]}
        />
      )}
    </StyledBlurView>
  );
}
