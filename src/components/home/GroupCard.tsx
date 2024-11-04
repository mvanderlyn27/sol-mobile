import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import GroupPic from "../modals/GroupPic";
import { Group, GroupMember } from "@/src/types/shared.types";
import Feather from "@expo/vector-icons/Feather";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { observer } from "@legendapp/state/react";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const GroupCard = observer(function GroupCard({ group }: { group: Group }) {
  if (!group) return null;
  const handleSelect = () => {
    console.log("test");
    router.push(`/journal/${group.id}`);
  };
  const handleEdit = () => {
    console.log("group", group);
    router.push(`/modals/group/${group.id}/groupDetails`);
  };
  const groupMemberList = groupMembers$.get();
  const groupMembersMap = Object.entries(groupMemberList || {}).reduce((acc: any, [_, member]) => {
    (acc[member.group_id] = acc[member.group_id] || []).push(member);
    return acc;
  }, {});
  const groupMembers = groupMembersMap[group.id];
  return (
    <StyledPressable
      className="flex-1 flex-col justify-center items-center rounded-xl  bg-[#F5EEE5]"
      onPress={handleSelect}>
      <StyledView className="flex-row p-4 flex-1">
        <GroupPic source={group.cover_url} placeholder={group.cover_placeholder} />
      </StyledView>
      <StyledPressable onPress={handleEdit}>
        <StyledView className="flex-row justify-center px-2">
          <StyledText className="text-lg">{group.name}</StyledText>
          <StyledFeather name="edit-2" size={24} color="black" className="px-2" />
        </StyledView>
        {groupMembers ? (
          <StyledView className="flex-row justify-between ">
            {groupMembers?.length <= 3 ? (
              <StyledView className="flex-row p-4 justify-between">
                {groupMembers.map((member: GroupMember, index: number) => (
                  <UserPic key={index + " " + member.id} userId={member.user_id} />
                ))}
              </StyledView>
            ) : (
              <StyledView className="flex-row p-2 justify-between">
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
