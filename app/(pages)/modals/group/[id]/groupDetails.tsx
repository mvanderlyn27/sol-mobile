import GroupPic from "@/src/components/modals/GroupPic";
import MemberList from "@/src/components/modals/MemberList";
import ProfilePic from "@/src/components/profile/ProfilePic";
import EditableText from "@/src/components/shared/EditableText";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import { deleteGroup, groups$ } from "@/src/stores/GroupStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { observer } from "@legendapp/state/react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const GroupDetails = observer(function GroupDetails() {
  let group_id = useLocalSearchParams().id;
  console.log(group_id);
  if (Array.isArray(group_id)) {
    group_id = group_id[0];
  }
  const selectedGroup = groups$[group_id].get();
  // const groupMembers = groupMemberStore$?.groupMembersMap[group_id].get();

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
  const handleUpdateName = (val: string) => {
    if (Array.isArray(group_id)) {
      group_id = group_id[0];
    }
    groups$[group_id].name.set(val);
  };
  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: "#F5EEE5" }}>
      <StyledView className="pt-10 flex-col justify-center items-center flex-1">
        <StyledView className="flex-row h-[250px] px-10">
          <GroupPic source={selectedGroup.cover_url} placeholder={selectedGroup.cover_placeholder} />
        </StyledView>
        <EditableText placeholder={selectedGroup.name} action={handleUpdateName} />
        <MemberList groupId={selectedGroup.id} />
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
});
export default GroupDetails;
