import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import GroupPic from "../modals/GroupPic";
import { Group } from "@/src/types/shared.types";
import Feather from "@expo/vector-icons/Feather";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

export default function CreateGroupButton() {
  const handleCreate = () => {
    router.push("/modals/group/createGroup");
  };
  const handleEdit = () => {};
  return (
    <StyledPressable
      className="h-full justify-center items-center bg-transparent rounded-xl  border-slate-500 border-dashed border-2"
      onPress={handleCreate}>
      <StyledView className="flex-col justify-center items-center">
        <StyledFeather name="plus" size={30} className="text-slate-500" />
        <StyledText className="text-slate-500 font-md"> Create new group</StyledText>
      </StyledView>
    </StyledPressable>
  );
}
