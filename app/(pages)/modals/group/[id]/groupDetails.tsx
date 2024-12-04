import GroupPic from "@/src/components/modals/GroupPic";
import MemberList from "@/src/components/modals/MemberList";
import ProfilePic from "@/src/components/profile/ProfilePic";
import EditableText from "@/src/components/shared/EditableText";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import authStore$ from "@/src/stores/AuthStore";
import { deleteGroup, groups$ } from "@/src/stores/GroupStore";
import { checkAdmin } from "@/src/stores/MemberStore";
import { observer } from "@legendapp/state/react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const GroupDetails = observer(function GroupDetails() {
  const { id }: { id: string } = useLocalSearchParams();
  const group_id = id;
  const currentUser = authStore$.session.get()?.user?.id;

  const selectedGroup = groups$[group_id].get();
  // const groupMembers = groupMemberStore$?.groupMembersMap[group_id].get();

  const handleEdit = () => {
    router.push("./editGroupMembers");
  };
  const handleInvite = () => {
    router.push("./inviteGroupMember");
  };
  const handleDelete = () => {
    deleteGroup(group_id);
  };
  const handleUpdateName = (val: string) => {
    groups$[group_id].name.set(val);
  };
  const isAdmin = currentUser ? checkAdmin(group_id, currentUser) : false;
  if (!selectedGroup) {
    return null;
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#F5EEE5" }}>
      <StyledView className="pt-4 flex-col justify-center items-center flex-1">
        <StyledView className="flex-row flex-1 px-20">
          <GroupPic editable={isAdmin} groupId={selectedGroup.id} />
        </StyledView>
        <StyledView className="flex-row flex-none px-10">
          {isAdmin ? (
            <EditableText placeholder={selectedGroup.name} action={handleUpdateName} />
          ) : (
            <StyledView className="flex-row flex-none px-10">
              <StyledText className="font-bold text-md py-2">{selectedGroup.name}</StyledText>
            </StyledView>
          )}
        </StyledView>
        <StyledView className="px-8 w-full h-[150px] flex-none justify-between">
          <MemberList groupId={selectedGroup?.id} />
        </StyledView>
        {isAdmin && (
          <StyledView className="flex-row flex-none  px-8 pb-4 justify-between">
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
        )}
      </StyledView>
    </View>
  );
});
export default GroupDetails;
