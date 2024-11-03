import { View, TextInput, Pressable, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ModalButton from "@/src/components/shared/ModalButton"; // Adjust this import if needed
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import ImageManipulator
import { Skeleton } from "moti/skeleton";
import { Image } from "expo-image";
import { Blurhash } from "react-native-blurhash";
import StorageService from "@/src/api/storage";
import { addGroup } from "@/src/stores/GroupStore";
import { AnimatePresence, MotiView } from "moti";

const StyledView = styled(View);
const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export default function CreateGroupModal() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [blurhash, setBlurhash] = useState<string | null>(null);

  const pickImage = async () => {
    setLoading(true);
    setBlurhash(null);
    setImage(null);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri;

      // Resize the image to 100x100 using ImageManipulator
      const resizedImage = await ImageManipulator.manipulateAsync(
        selectedImageUri,
        [{ resize: { width: 100, height: 100 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      console.log("resizedImage");
      // Generate the blurhash using the resized image's URI and its new dimensions
      const blurhash = await Blurhash.encode(resizedImage.uri, 4, 3);
      console.log("blurhash", blurhash);
      setBlurhash(blurhash);
      setImage(selectedImageUri); // Set the original image URI here for display purposes
    }

    setLoading(false);
  };

  const handleCreateGroup = async () => {
    console.log(`Creating group: ${groupName} with blurh: ${blurhash}`);
    if (image && blurhash && groupName) {
      addGroup(groupName, image, blurhash);
    }
    // Add further functionality as needed
  };

  return (
    <StyledView className="flex-1 items-center justify-center " style={{ padding: 10 }}>
      {/* Modal Content */}
      {/* Group Image Placeholder */}
      <StyledPressable className="flex-row px-10" onPress={pickImage}>
        <AnimatePresence exitBeforeEnter>
          {!loading && !image && (
            <StyledMotiView
              key="placeholder"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 300 }}
              className="w-full h-60 bg-gray-300 rounded-lg overflow-hidden mb-6 items-center justify-center">
              <AntDesign name="picture" size={32} color="white" />
            </StyledMotiView>
          )}
          {loading && !image && (
            <StyledMotiView
              key="skeleton"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 300 }}
              className="w-full h-60 rounded-lg overflow-hidden mb-6 items-center justify-center">
              <Skeleton colorMode={"dark"} width={"100%"} height={"100%"} />
            </StyledMotiView>
          )}
          {image && (
            <StyledMotiView
              key="image"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 300 }}
              className="w-full h-60 rounded-lg overflow-hidden mb-6 items-center justify-center">
              <Image style={{ width: "100%", height: "100%" }} source={{ uri: image }} />
            </StyledMotiView>
          )}
        </AnimatePresence>
      </StyledPressable>

      {/* Group Name Input */}
      <StyledView className="flex-row px-10">
        <StyledTextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="New Group"
          placeholderTextColor="#9c9c9c"
          className="w-full p-4 border border-black rounded-lg text-center bg-transparent mb-6"
        />
      </StyledView>

      {/* Create Button */}
      <StyledView className="flex-row px-10">
        <ModalButton action={handleCreateGroup} text="Create" color="bg-[#FFA500]" />
      </StyledView>
    </StyledView>
  );
}
