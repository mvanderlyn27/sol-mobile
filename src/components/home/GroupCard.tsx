import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import GroupPic from "../modals/GroupPic";
import { ButtonType, Group, GroupMember } from "@/src/types/shared.types";
import Feather from "@expo/vector-icons/Feather";
import { observer } from "@legendapp/state/react";
import RectangleButton from "../shared/RectangleButton";
import CircleButton from "../shared/CircleButton";
import { filterGroupMembers, filterPendingGroupMembers } from "@/src/services/Group";
import { groupMembers$ } from "@/src/stores/MemberStore";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const GroupCard = observer(function GroupCard({ group, invitation }: { group: Group; invitation?: boolean }) {
  // console.log("re-rendering group card", group.id);
  if (!group) return null;
  const handleSelect = () => {
    if (invitation) {
      router.push(`/modals/group/${group.id}/groupInvitation`);
    } else {
      router.push(`/journal/${group.id}`);
    }
  };
  const handleEdit = () => {
    if (invitation) {
      router.push(`/modals/group/${group.id}/groupInvitation`);
    } else {
      router.push(`/modals/group/${group.id}/groupDetails`);
    }
  };
  const gm = groupMembers$.get();
  const groupMemberList = Object.values(filterGroupMembers(groupMembers$.get() || {}, group.id) || {});
  const pendingMemberList = Object.values(filterPendingGroupMembers(groupMembers$.get() || {}, group.id) || {});
  const groupList = [...groupMemberList, ...pendingMemberList];
  console.log(
    "group list",
    groupList.map((gm) => gm.user_id)
  );
  return (
    <StyledPressable
      className={`flex-1 flex-col justify-center items-center rounded-xl  ${
        invitation ? "bg-primary" : "bg-[#F5EEE5]"
      }`}
      onPress={handleEdit}>
      <StyledView className="flex-row justify-between items-center px-4 py-2 w-full">
        <StyledText className="text-md font-bold text-left truncate flex-1">{group.name} </StyledText>
        <StyledFeather name="edit-2" size={20} color="black" className="" />
      </StyledView>

      <StyledPressable onPress={handleSelect} className="flex-row px-4 pb-4 flex-1">
        <GroupPic groupId={group.id} invitation={invitation} />
      </StyledPressable>
      {/* <StyledPressable className="flex-row px-4 py-2 " onPress={handleEdit}> */}
      {groupList ? (
        <StyledView className="flex-row justify-between ">
          {groupList?.length <= 3 ? (
            <StyledView className="flex-row px-4 pb-4 justify-between">
              {groupList.map((member: GroupMember, index: number) => (
                <UserPic key={index + " " + member.id} userId={member.user_id} pending={member.status === "pending"} />
              ))}
            </StyledView>
          ) : (
            <StyledView className="flex-row px-4 pb-4 ">
              <UserPic userId={groupList[0].user_id} pending={groupList[0].status === "pending"} />
              <UserPic userId={groupList[1].user_id} pending={groupList[1].status === "pending"} />
              <UserPic number={groupList.length - 2} />
            </StyledView>
          )}
        </StyledView>
      ) : (
        <StyledView className="h-[50px]"></StyledView>
      )}

      {/* </StyledPressable> */}
    </StyledPressable>
  );
});
export default GroupCard;
