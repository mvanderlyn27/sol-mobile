import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import GroupPic from "../modals/GroupPic";
import { Group, Member } from "@/src/types/shared.types";
import Feather from "@expo/vector-icons/Feather";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

export default function GroupCard({ group }: { group: Group }) {
  const handleSelect = () => {
    console.log("test");
    router.push("/journal/1");
  };
  const handleEdit = () => {
    router.push("/modals/group/1/groupDetails");
  };
  return (
    <StyledPressable
      className="flex-1 flex-col justify-center items-center rounded-xl  bg-[#F5EEE5]"
      onPress={handleSelect}>
      <StyledView className="flex-row p-4 flex-1">
        <GroupPic />
      </StyledView>
      <StyledPressable onPress={handleEdit}>
        <StyledView className="flex-row justify-between p-2">
          <StyledText className="text-lg">{group.name}</StyledText>
          <StyledFeather name="edit-2" size={24} color="black" />
        </StyledView>
        {group.groupMembers.length <= 3 ? (
          <StyledView className="flex-row p-4 justify-between">
            {group.groupMembers.map((member: Member, index: number) => (
              <UserPic key={index + " " + member.id} />
            ))}
          </StyledView>
        ) : (
          <StyledView className="flex-row p-2 justify-between">
            <UserPic />
            <UserPic />
            <UserPic number={3} />
          </StyledView>
        )}
      </StyledPressable>
    </StyledPressable>
  );
}
