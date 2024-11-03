import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import { Member } from "@/src/types/shared.types";
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
      <StyledView className="absolute left-0 z-10">
        <StyledPressable
          onPress={() => {
            console.log("back");
            router.back();
          }}
          className="p-4 ">
          <AntDesign name="left" size={24} color="black" />
        </StyledPressable>
      </StyledView>
      <StyledView className="flex-row justify-center items-center p-4 ">
        <StyledText className="text-lg font-bold">Edit Group Members</StyledText>
      </StyledView>
      <StyledView className="flex-1 justify-start items-center w-full ">
        <StyledScrollView className="flex-col w-full mb-4 ">
          {membersList.map((member: Member, index: number) => (
            <StyledView key={index} className="flex-row p-4 items-center">
              <UserPic />
              <StyledView className="flex-row justify-start flex-1 pl-4  ">
                <Text>{member.name}</Text>
              </StyledView>
              <ModalButton
                disabled={false}
                action={() => handleRemove(member.id)}
                color={"bg-red-500"}
                textColor={"text-white"}
                text={"Remove"}
              />
            </StyledView>
          ))}
        </StyledScrollView>
        <StyledView className="flex-row px-10">
          <ModalButton disabled={false} action={handleInvite} color={"bg-primary"} text="Invite new" />
        </StyledView>
      </StyledView>
      <Link href="/home"></Link>
    </StyledView>
  );
}
