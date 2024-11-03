import GroupPic from "@/src/components/modals/GroupPic";
import ProfilePic from "@/src/components/modals/ProfilePic";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import { Member } from "@/src/types/shared.types";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

export default function EditGroupMember() {
  const membersList = [
    { avatar_url: "", id: "1", name: "cool", group_id: "" },
    { avatar_url: "", id: "2", name: "cool", group_id: "" },
    { avatar_url: "", id: "3", name: "cool", group_id: "" },
    { avatar_url: "", id: "4", name: "cool", group_id: "" },
    { avatar_url: "", id: "5", name: "cool", group_id: "" },
    { avatar_url: "", id: "6", name: "cool", group_id: "" },
    { avatar_url: "", id: "7", name: "cool", group_id: "" },
    { avatar_url: "", id: "8", name: "cool", group_id: "" },
    { avatar_url: "", id: "9", name: "cool", group_id: "" },
    { avatar_url: "", id: "10", name: "cool", group_id: "" },
  ];

  const handleRemove = (userId: string) => {};
  const handleInvite = () => {
    router.push("./inviteGroupMember");
  };

  return (
    <StyledView className="flex-1 flex-col px-8 bg-[#F5EEE5]">
      <StyledView className="absolute left-0 top-0 z-10">
        <StyledPressable
          onPress={() => {
            console.log("back");
            router.back();
          }}
          className="p-4">
          <AntDesign name="left" size={24} color="black" />
        </StyledPressable>
      </StyledView>

      <StyledView className="flex-1 justify-center items-center w-full ">
        <StyledView className="flex-row px-4">
          <ProfilePic />
        </StyledView>
        <StyledView className="flex-row  items-center px-10 p-4">
          <StyledText>UsER NAME</StyledText>
          <StyledFeather name="edit-2" size={24} color="black" className="p-2" />
        </StyledView>

        {/* Separator */}
        <StyledView className="w-full h-[1px] my-4 bg-slate-400" />

        <StyledView className="flex-row justify-between pb-4 ">
          <StyledView className="flex-col flex-1 px-2 itmes-center">
            <StyledText className="font-bold">Groups</StyledText>
            <StyledText className="p-4 text-lg">2</StyledText>
          </StyledView>
          <StyledView className="flex-col flex-1 px-2 items-center">
            <StyledText className="font-bold">Friends</StyledText>
            <StyledText className="p-4 text-lg">7</StyledText>
          </StyledView>
          <StyledView className="flex-col flex-1 px-2 items-center">
            <StyledText className="font-bold">Entries</StyledText>
            <StyledText className="p-4 text-lg">106</StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="flex-row px-10 mt-4">
          <ModalButton disabled={false} action={handleInvite} color={"bg-primary"} text="Invite friend" />
        </StyledView>
      </StyledView>

      <Link href="/home"></Link>
    </StyledView>
  );
}
