import { useCanvas } from "@/src/contexts/CanvasProvider";
import { useJournal } from "@/src/contexts/JournalProvider";
import { BottomDrawerType, CanvasFrame } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { Pressable, Text, Image, Dimensions } from "react-native";
import BottomDrawer, { BottomDrawerMethods } from "react-native-animated-bottom-drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import Drawer from "../../shared/Drawer";
import RectangleButton from "../../shared/RectangleButton";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/src/contexts/AuthProvider";
import * as FileSystem from "expo-file-system";
import MaskedView from "@react-native-masked-view/masked-view";
import { Skeleton } from "moti/skeleton";

const StyledMotiView = styled(MotiView);
const StyledBottomDrawer = styled(BottomDrawer);
const StyledText = styled(Text);
const StyledIon = styled(Ionicons);
const StyledMaskedView = styled(MaskedView);
const StyledPressable = styled(Pressable);
const { width, height } = Dimensions.get("window");
export const StyledImage = styled(Image);

export default function EditCanvasFrame({ item }: { item: CanvasFrame }) {
  //might need to recheck this math
  const bottomDrawerRef = useRef<BottomDrawerMethods>(null);
  const {
    saveCanvasItemEdits,
    exitEditCanvas,
    uploadingImage,
    updateCanvasItemImage,
    removeCanvasItem,
    exitEditCanvasItem,
  } = useCanvas();
  const { setBottomBarVisible } = useJournal();
  const { session } = useAuth();
  const aspectRatio = item.width / item.height;
  const maxFrameWidth = width * 0.8;
  const [showBottomDrawer, setShowBottomDrawer] = useState(false);
  const handleDone = () => {
    saveCanvasItemEdits(item.id, { ...item });
    setBottomBarVisible(true);
  };
  const startDelete = () => {
    setShowBottomDrawer(true);
  };
  const handleDelete = () => {
    exitEditCanvasItem();
    removeCanvasItem(item.id);
    setShowBottomDrawer(false);
    setBottomBarVisible(true);
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
      const img = result.assets[0];
      const fullFileName = img.uri.split("/").pop();
      const fileName = fullFileName?.substring(0, fullFileName.lastIndexOf(".")) || fullFileName; // File name without extension
      const fileExtension = fullFileName?.split(".").pop(); // File extension
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: "base64" });
      console.log("file type", fullFileName);

      updateCanvasItemImage(item.id, base64, fileName || "image" + Date.now(), fileExtension || "jpg");
      // await supabase.storage.from('files').upload(filePath, decode(base64), { contentType });
      // loadImages();
    }
  };

  const handleupdatePhoto = () => {};
  const getScale = (frameWidth: number, frameHeight: number, screenWidth: number, screenHeight: number): number => {
    // Calculate 70% of screen dimensions
    const targetWidth = screenWidth * 0.9;
    const targetHeight = screenHeight * 0.9;

    // Calculate the scaling factors for both width and height
    const scaleWidth = targetWidth / frameWidth;
    const scaleHeight = targetHeight / frameHeight;

    // The maximum scale is the smaller of the two scaling factors
    return Math.min(scaleWidth, scaleHeight);
  };
  const scale = getScale(item.width, item.height, width, height);
  const scaledWidth = scale * item.width;
  const scaledHeight = scale * item.height;
  console.log("scale", scale, scaledWidth, scaledHeight, width, height);

  return (
    <StyledMotiView className="absolute top-0 bottom-0 right-0 left-0 bg-black/80">
      {/* Centered image */}
      <StyledMotiView className="flex-1 justify-center items-center">
        <StyledMotiView className="flex-col items-center justify-center ">
          {/* <Image
            source={{ uri: item.path }} // Replace with your image URL or source
            style={{ width: maxFrameWidth, height: maxFrameWidth / aspectRatio, borderRadius: 10 }}
          /> */}
          <StyledMotiView style={{ width: scaledWidth, height: scaledHeight, padding: 4 }}>
            {!uploadingImage ? (
              <StyledMaskedView
                className="w-full h-full"
                maskElement={
                  <StyledImage
                    //   className={`w-[${item.width}px] h-[${item.height}px]`}
                    className="flex-1"
                    source={{ uri: item.slots[0].maskPath }}
                  />
                }>
                {item?.slots[0]?.image?.url && (
                  <StyledImage className="flex-1" source={{ uri: item.slots[0].image.url }} />
                )}
              </StyledMaskedView>
            ) : (
              <Skeleton width={scaledWidth} height={scaledHeight} />
            )}
            <StyledMotiView className="absolute inset-0 w-full h-full p-4">
              <StyledMotiView className={`flex-1`}>
                <StyledImage className="flex-1" source={{ uri: item.path }} />
              </StyledMotiView>
            </StyledMotiView>
          </StyledMotiView>
          <AnimatePresence exitBeforeEnter>
            {!uploadingImage && (
              <StyledMotiView
                key="buttons"
                className="flex flex-row justify-center items-center"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 500 }}>
                {!item.slots[0].image && (
                  <RectangleButton text="Add Photo" color="bg-primary" textColor="text-white" action={handleAddPhoto} />
                )}
                {item.slots[0].image && (
                  <RectangleButton
                    text="Update Photo"
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
                className={`bg-slate-200 px-7 py-3 rounded-full shadow-md flex justify-center items-center`}
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 500 }}>
                <StyledText className={`text-darkPrimary text-lg font-bold`}>Uploading...</StyledText>
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
      <StyledMotiView className="absolute top-16  right-8">
        <StyledPressable onPress={handleDone} className="bg-clear px-4 py-2 rounded-md">
          <StyledText className="text-white text-lg">Done</StyledText>
        </StyledPressable>
      </StyledMotiView>
      {showBottomDrawer && (
        <Drawer
          key="edit-frame-bottom-drawer"
          text={"Are you sure you want to delete?"}
          buttons={[{ action: handleDelete, text: "Yep, Delete it!", color: "bg-red-500" }]}
        />
      )}
    </StyledMotiView>
  );
}
