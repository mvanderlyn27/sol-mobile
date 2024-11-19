import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import GroupPic from "../modals/GroupPic";
import { Group, GroupMember } from "@/src/types/shared.types";
import Feather from "@expo/vector-icons/Feather";
import { observer } from "@legendapp/state/react";
import { filterOutPending, groupMembers$ } from "@/src/stores/MemberStore";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const GroupCard = observer(function GroupCard({ group, invitation }: { group: Group; invitation?: boolean }) {
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
  const groupMemberList = filterOutPending(groupMembers$.get());
  console.log("groupMembers", groupMemberList);
  const groupMembersMap = Object.entries(groupMemberList || {}).reduce((acc: any, [_, member]) => {
    (acc[member.group_id] = acc[member.group_id] || []).push(member);
    return acc;
  }, {});
  const groupMembers = groupMembersMap[group.id];
  console.log("groupMembers", groupMembers);
  return (
    <StyledPressable
      className={`flex-1 flex-col justify-center items-center rounded-xl  ${
        invitation ? "bg-primary" : "bg-[#F5EEE5]"
      }`}
      onPress={handleSelect}>
      <StyledView className="flex-row px-4 pt-4 flex-1">
        <GroupPic groupId={group.id} invitation={invitation} />
      </StyledView>
      <StyledPressable onPress={handleEdit}>
        <StyledView className="flex-row justify-center px-4">
          <StyledText className="text-md font-bold py-2 text-left w-full">{group.name}</StyledText>
          {/* <StyledFeather name="edit-2" size={24} color="black" className="px-2" /> */}
        </StyledView>
        {groupMembers ? (
          <StyledView className="flex-row justify-between ">
            {groupMembers?.length <= 3 ? (
              <StyledView className="flex-row px-4 pb-4 justify-between">
                {groupMembers.map((member: GroupMember, index: number) => (
                  <UserPic key={index + " " + member.id} userId={member.user_id} />
                ))}
              </StyledView>
            ) : (
              <StyledView className="flex-row px-4 pb-4 ">
                <UserPic userId={groupMembers[0].id} />
                <UserPic userId={groupMembers[1].id} />
                <UserPic number={3} />
              </StyledView>
            )}
          </StyledView>
        ) : (
          <StyledView className="h-[50px]"></StyledView>
        )}
      </StyledPressable>
    </StyledPressable>
  );
});
export default GroupCard;
