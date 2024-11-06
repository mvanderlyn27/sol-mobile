import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import authStore$ from "@/src/stores/AuthStore";
import { filterOutPending, groupMembers$, removeMember } from "@/src/stores/MemberStore";
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
  const ensureNotArray = (input: string | string[]) => {
    if (Array.isArray(input)) {
      return input[0];
    }
    return input;
  };
  let groupId = ensureNotArray(useLocalSearchParams().id);

  const userId = authStore$.session.get()?.user.id;
  if (!userId) return null;
  const groupMembersMap = Object.entries(filterOutPending(groupMembers$.get()) || {}).reduce(
    (acc: any, [_, member]) => {
      (acc[member.group_id] = acc[member.group_id] || []).push(member);
      return acc;
    },
    {}
  );
  const groupMembers = groupMembersMap[groupId];
  if (!groupMembers) return null;

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
        <StyledText className="text-lg font-bold">Edit Members</StyledText>
      </StyledView>
      <StyledView className="flex-1 justify-start items-center w-full ">
        <StyledScrollView className="flex-col w-full mb-4 ">
          {groupMembers.map((member: GroupMember, index: number) => (
            <StyledView key={index} className="flex-row py-4 items-center">
              <UserPic userId={member.user_id} />
              <StyledView className="flex-row justify-start flex-1 pl-4  ">
                <Text>{profiles$[member.user_id].username.get() || profiles$[member.user_id].name.get()}</Text>
              </StyledView>
              {member.user_id !== userId ? (
                <StyledView className="w-[90px] ">
                  <ModalButton
                    disabled={false}
                    action={() => removeMember(groupId, member.user_id)}
                    color={"bg-red-500"}
                    textColor={"text-white"}
                    text={"Remove"}
                  />
                </StyledView>
              ) : (
                <StyledView className="w-[90px] ">
                  <ModalButton
                    disabled={true}
                    // action={() => removeMember(groupId, member.user_id)}
                    color={"bg-slate-300"}
                    textColor={"text-white"}
                    text={"Its You!"}
                  />
                </StyledView>
              )}
            </StyledView>
          ))}
        </StyledScrollView>
        <StyledView className="flex-row px-20 ">
          <ModalButton disabled={false} action={handleInvite} color={"bg-primary"} text="Invite new" />
        </StyledView>
      </StyledView>
      <Link href="/home"></Link>
    </StyledView>
  );
});
export default EditGroupMembers;
