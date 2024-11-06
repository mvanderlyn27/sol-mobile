import GroupPic from "@/src/components/modals/GroupPic";
import ProfilePic from "@/src/components/modals/ProfilePic";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import authStore$ from "@/src/stores/AuthStore";
import { groups$ } from "@/src/stores/GroupStore";
import { checkAdmin, filterOutPending, groupMembers$, removeMember } from "@/src/stores/MemberStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { Group } from "@/src/types/shared.types";
import { AntDesign } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

const UserProfile = observer(function UserProfile() {
  const ensureNotArray = (input: string | string[]) => {
    if (Array.isArray(input)) {
      return input[0];
    }
    return input;
  };
  const userId = ensureNotArray(useLocalSearchParams().id);
  const currentUser = authStore$.session.get()?.user.id;
  const groupId = ensureNotArray(useLocalSearchParams().groupId);

  const isAdmin = currentUser ? checkAdmin(groupId, currentUser) : false;

  const profile = profiles$[userId].get();
  const groupList = Array.from(
    new Set(
      Object.values(filterOutPending(groupMembers$.get()) || {})
        .filter((groupMember) => groupMember.user_id === userId) // Filter by user_id
        .map((groupMember) => groupMember.group_id) // Extract group_id
    )
  );
  console.log("g list", groupList);

  const handleInvite = () => {
    router.push("./inviteGroupMember");
  };
  const handleRemove = () => {
    removeMember(groupId, userId);
    router.back();
  };
  return (
    <StyledView className="flex-1 flex-col px-8 bg-[#F5EEE5]">
      <StyledView className="absolute left-0 top-0 z-10">
        <StyledPressable
          onPress={() => {
            console.log("back");
            router.back();
          }}
          className="p-4">
          <AntDesign name="left" size={24} color="black" />
        </StyledPressable>
      </StyledView>

      <StyledView className="flex-1 pt-20 justify-center items-center w-full ">
        <StyledView className="flex-row px-20">
          <ProfilePic userId={userId} />
        </StyledView>
        <StyledView className="flex-row px-10 p-4">
          <StyledText className="font-bold">{profile.username || profile.name}</StyledText>
        </StyledView>

        {/* Separator */}
        <StyledView className="w-full h-[1px] my-4 bg-slate-400" />

        <StyledView className="flex-col ">
          <StyledText className="font-bold my-4">Groups:</StyledText>

          {/* Horizontal ScrollView for GroupPics */}
          <StyledView className=" w-full h-[125px]">
            <StyledScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: "100%" }}>
              {groupList.map((groupId: string, index: number) => {
                return (
                  <StyledView key={index} className="w-col px-2 items-center w-[85px] h-[125px]">
                    <GroupPic groupId={groupId} />
                    <StyledText className="p-2">{groups$[groupId].name.get()}</StyledText>
                  </StyledView>
                );
              })}
            </StyledScrollView>
          </StyledView>
        </StyledView>

        {groupId && userId && isAdmin && (
          <StyledView className="flex-row flex-none px-10 pb-8">
            <ModalButton
              disabled={false}
              action={handleRemove}
              color={"bg-red-500"}
              text={`remove from ${groups$[groupId].name.get()}`}
            />
          </StyledView>
        )}
      </StyledView>
    </StyledView>
  );
});
export default UserProfile;
