import GroupPic from "@/src/components/modals/GroupPic";
import MemberList from "@/src/components/modals/MemberList";
import ProfilePic from "@/src/components/profile/ProfilePic";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import { deleteGroup, groups$ } from "@/src/stores/GroupStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
export default function groupDetails() {
  let group_id = useLocalSearchParams().id;
  console.log(group_id);
  if (Array.isArray(group_id)) {
    group_id = group_id[0];
  }
  const selectedGroup = groups$[group_id].get();
  // const groupMembers = groupMemberStore$?.groupMembersMap[group_id].get();
  const groupMembersMap = Object.entries(groupMembers$.get()).reduce((acc: any, [_, member]) => {
    (acc[member.group_id] = acc[member.group_id] || []).push(member);
    return acc;
  }, {});
  const groupMembers = groupMembersMap[group_id];
  const handleEdit = () => {
    router.push("./editGroupMembers");
  };
  const handleInvite = () => {
    router.push("./inviteGroupMember");
  };
  const handleDelete = () => {
    console.log("group_id", group_id);
    if (Array.isArray(group_id)) {
      group_id = group_id[0];
    }
    console.log("id", group_id);
    deleteGroup(group_id);
  };
  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: "#F5EEE5" }}>
      <StyledView className="pt-10 flex-col justify-center items-center flex-1">
        <StyledView className="flex-row h-[250px] px-10">
          <GroupPic source={selectedGroup.cover_url} placeholder={selectedGroup.cover_placeholder} />
        </StyledView>
        <StyledText>{selectedGroup.name}</StyledText>
        <MemberList members={groupMembers} />
        <StyledView className="flex-row px-4 pb-4 justify-between">
          <ModalButton
            action={handleEdit}
            color="bg-black"
            text="Edit Members"
            disabled={false}
            textColor={"text-white"}
          />
          <ModalButton
            action={handleInvite}
            color="bg-primary"
            text="Invite New"
            disabled={false}
            textColor={"text-white"}
          />
        </StyledView>
      </StyledView>
      <StyledView className="flex-row px-4 pb-4 justify-between">
        <ModalButton action={handleDelete} color="bg-red-500" text="delete" disabled={false} textColor={"text-white"} />
      </StyledView>
    </View>
  );
}
