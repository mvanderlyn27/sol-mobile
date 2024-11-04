import GroupPic from "@/src/components/modals/GroupPic";
import ProfilePic from "@/src/components/modals/ProfilePic";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import { AntDesign } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

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
        <StyledView className="flex-row px-10">
          <ProfilePic />
        </StyledView>
        <StyledView className="flex-row px-10 p-4">
          <StyledText>UsER NAME</StyledText>
        </StyledView>

        {/* Separator */}
        <StyledView className="w-full h-[1px] my-4 bg-slate-400" />

        <StyledView className="flex-col pb-4">
          <StyledText className="mb-2">Groups:</StyledText>

          {/* Horizontal ScrollView for GroupPics */}
          <StyledView className="mt-2 w-full h-[200px]">
            <StyledScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 ">
              {membersList.map((member, index) => {
                console.log("member");
                return (
                  <StyledView key={index} className="w-col px-2 items-center w-[125px] h-[200px]">
                    <GroupPic />
                    <StyledText className="p-2">Name</StyledText>
                  </StyledView>
                );
              })}
            </StyledScrollView>
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
