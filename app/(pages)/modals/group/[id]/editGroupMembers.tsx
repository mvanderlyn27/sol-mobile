import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import authStore$ from "@/src/stores/AuthStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { GroupMember, Profile } from "@/src/types/shared.types";
import { AntDesign } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const EditGroupMembers = observer(function EditGroupMembers() {
  let groupId = useLocalSearchParams().id;
  console.log(groupId);
  if (Array.isArray(groupId)) {
    groupId = groupId[0];
  }
  const userId = authStore$.session.get()?.user.id;
  if (!userId) return null;
  const groupMembersMap = Object.entries(groupMembers$.get()).reduce((acc: any, [_, member]) => {
    (acc[member.group_id] = acc[member.group_id] || []).push(member);
    return acc;
  }, {});
  const groupMembers = groupMembersMap[groupId];
  if (!groupMembers) return null;
  const handleRemove = (userId: string) => {
    const id = Object.entries(groupMembers$.get()).find(
      ([, groupMember]) => groupMember.group_id === groupId && groupMember.user_id === userId
    )?.[0];
    console.log("id", id);
    if (!id) {
      console.log("user not found");
      return;
    }
    groupMembers$[id].delete();
  };
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
          {groupMembers.map((member: GroupMember, index: number) => (
            <StyledView key={index} className="flex-row py-4 items-center">
              <UserPic userId={member.user_id} />
              <StyledView className="flex-row justify-start flex-1 pl-4  ">
                <Text>{profiles$[member.user_id].username.get() || profiles$[member.user_id].name.get()}</Text>
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
});
export default EditGroupMembers;
