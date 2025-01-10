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
import { AnimatePresence, MotiView } from "moti";
import { resizeImage } from "@/src/services/Media";
import { joinGroup } from "@/src/services/Group";
import { addNotification } from "@/src/stores/NotificationStore";
import { NotificationType } from "@/src/types/shared.types";
import { generateId } from "@/src/stores/AsyncStorage";

const StyledView = styled(View);
const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export default function JoinGroupModal() {
  const router = useRouter();
  const [groupCode, setgroupCode] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const handleJoinGroup = async () => {
    setCreating(true);
    if (groupCode) {
      const id = await joinGroup(groupCode);
      if (id) {
        addNotification({
          id: generateId(),
          message: "Joined Group",
          type: NotificationType.success,
        });
        setCreating(false);
        router.push(`./${id}/groupDetails`);
      }
    }

    setCreating(false);
    // Add further functionality as needed
  };

  return (
    <StyledView className="flex-1 items-center justify-center " style={{ padding: 10 }}>
      {/* Modal Content */}
      {/* Group Image Placeholder */}

      {/* Group Name Input */}

      <StyledView className="flex-col p-4">
        <StyledView className="flex-row py-4">
          <StyledTextInput
            value={groupCode}
            onChangeText={setgroupCode}
            placeholder="Group Code"
            placeholderTextColor="#9c9c9c"
            className="w-full p-4 border border-black rounded-lg text-center bg-transparent"
          />
        </StyledView>

        {/* Create Button */}
        <StyledView className="flex-row px-20">
          <ModalButton
            disabled={creating || loading || !groupCode}
            action={handleJoinGroup}
            text="Join"
            color="bg-[#FFA500]"
          />
        </StyledView>
      </StyledView>
    </StyledView>
  );
}
