import { View, TextInput, Pressable, Text, Image } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ModalButton from "@/src/components/shared/ModalButton"; // Adjust this import if needed
import { styled } from "nativewind";
import { useRouter } from "expo-router";
import { useState } from "react";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export default function CreateGroupModal() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");

  const handleCreateGroup = () => {
    console.log(`Creating group: ${groupName}`);
    // Add further functionality as needed
  };

  return (
    <StyledView className="flex-1 items-center justify-center " style={{ padding: 10 }}>
      {/* Modal Content */}
      {/* Group Image Placeholder */}
      <StyledView className="flex-row px-10">
        <StyledView className="w-full h-60 bg-gray-300 rounded-lg mb-6 items-center justify-center">
          <AntDesign name="picture" size={32} color="white" />
        </StyledView>
      </StyledView>

      {/* Group Name Input */}
      <StyledView className="flex-row px-10">
        <StyledTextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder="New Group"
          placeholderTextColor="#9c9c9c"
          className="w-full  p-4 border border-black rounded-lg text-center bg-transparent mb-6"
        />
      </StyledView>
      {/* Create Button */}
      <StyledView className="flex-row px-10">
        <ModalButton
          action={handleCreateGroup}
          text="Create"
          color="bg-[#FFA500]"
          // className="py-3 px-8 rounded-lg"
        />
      </StyledView>
    </StyledView>
  );
}
