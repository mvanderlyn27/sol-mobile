import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import GroupPic from "../modals/GroupPic";
import { ButtonType, Group } from "@/src/types/shared.types";
import Feather from "@expo/vector-icons/Feather";
import ModalButton from "../shared/ModalButton";
import ModalIconButton from "../shared/ModalIconButton";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function CreateGroupButton() {
  const handleCreate = () => {
    router.push("/modals/group/createGroup");
  };
  const handleJoin = () => {
    router.push("/modals/group/joinGroup");
  };
  return (
    <StyledView className="h-full justify-center items-center bg-transparent rounded-xl  border-slate-500 border-dashed border-2">
      <StyledView className="flex-col justify-center items-center">
        <StyledView className="flex-row justify-center items-center p-2">
          <ModalIconButton
            text="Create group"
            action={handleCreate}
            color={"bg-primary"}
            buttonType={ButtonType.CreateGroup}
          />
        </StyledView>
        <StyledView className="flex-row justify-center items-center p-2">
          <ModalIconButton
            text="Join group"
            action={handleJoin}
            color={"bg-secondary"}
            textColor={"text-darkPrimary"}
            buttonType={ButtonType.JoinGroup}
          />
        </StyledView>
      </StyledView>
    </StyledView>
  );
}
