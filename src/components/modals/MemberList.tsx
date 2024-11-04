import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import { GroupMember } from "@/src/types/shared.types";
import { profiles$ } from "@/src/stores/ProfileStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import authStore$ from "@/src/stores/AuthStore";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// Helper function to split the members array into chunks of 8
function chunkArray(array: GroupMember[], size: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default function MemberList({ groupId }: { groupId: string }) {
  // Split members into chunks of 8 for each page
  const userId = authStore$.session.get()?.user.id;
  if (!userId) return null;
  const groupMembersMap = Object.entries(groupMembers$.get()).reduce((acc: any, [_, member]) => {
    (acc[member.group_id] = acc[member.group_id] || []).push(member);
    return acc;
  }, {});
  const groupMembers = groupMembersMap[groupId];
  if (!groupMembers) return null;
  console.log("members", groupMembers);
  const pages = chunkArray(groupMembers, 8);
  const visitMember = (memberId: string) => {
    console.log("clicked");
    if (memberId === userId) {
      router.push(`/modals/profile?back=true`);
    } else {
      router.push(`/modals/profile/${memberId}`);
    }
  };
  return (
    <PagerView style={{ flex: 1, width: "100%" }} initialPage={0} overdrag overScrollMode={"auto"}>
      {pages.map((page, pageIndex) => (
        <StyledView key={pageIndex} className=" justify-start items-center p-4">
          <StyledView className="flex-row flex-wrap ">
            {page.map((member: GroupMember, index) => {
              return (
                <StyledPressable
                  pointerEvents="box-only"
                  onPress={() => visitMember(member.user_id)}
                  key={index}
                  className="w-1/4  pt-4 justify-center items-center">
                  {/* <UserPic source={ member.avatar_url } /> */}
                  <UserPic userId={member.user_id} />
                  <StyledText className="text-center mt-2">
                    {profiles$[member.user_id].username.get() || profiles$[member.user_id].name.get()}
                  </StyledText>
                </StyledPressable>
              );
            })}
          </StyledView>
        </StyledView>
      ))}
    </PagerView>
  );
}
