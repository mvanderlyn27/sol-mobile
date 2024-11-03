import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import UserPic from "../shared/UserPic";
import { router } from "expo-router";
import { Member } from "@/src/types/shared.types";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// Helper function to split the members array into chunks of 8
function chunkArray(array: Member[], size: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default function MemberList({ members }: { members: Member[] }) {
  // Split members into chunks of 8 for each page
  const pages = chunkArray(members, 8);
  const visitMember = (memberId: string) => {
    console.log("clicked");
    router.push(`/modals/profile/${memberId}`);
  };
  return (
    <PagerView style={{ flex: 1, width: "100%" }} initialPage={0} overdrag overScrollMode={"auto"}>
      {pages.map((page, pageIndex) => (
        <StyledView key={pageIndex} className=" justify-start items-center p-4">
          <StyledView className="flex-row flex-wrap ">
            {page.map((member, index) => {
              console.log("member", member);
              return (
                <StyledPressable
                  pointerEvents="box-only"
                  onPress={() => visitMember(member.id)}
                  key={index}
                  className="w-1/4  pt-4 justify-center items-center">
                  {/* <UserPic source={ member.avatar_url } /> */}
                  <UserPic />
                  <StyledText className="text-center mt-2">{member.name}</StyledText>
                </StyledPressable>
              );
            })}
          </StyledView>
        </StyledView>
      ))}
    </PagerView>
  );
}
