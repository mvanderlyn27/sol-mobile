import GroupPic from "@/src/components/modals/GroupPic";
import ProfilePic from "@/src/components/modals/ProfilePic";
import ModalButton from "@/src/components/shared/ModalButton";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { AntDesign } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { StyledView, StyledPressable, StyledText, StyledScrollView } from "./[id]";

const EditGroupMember = observer(function EditGroupMember() {
  let userId = useLocalSearchParams().id;
  console.log(userId);
  if (Array.isArray(userId)) {
    userId = userId[0];
  }
  const groupsSeen = new Set();
  const groupList = Array.from(
    new Set(
      Object.values(groupMembers$.get())
        .filter((groupMember) => groupMember.user_id === userId) // Filter by user_id
        .map((groupMember) => groupMember.group_id) // Extract group_id
    )
  );
  console.log("g list", groupList);

  const handleRemove = (userId: string) => {};
  const handleInvite = () => {
    router.push("./inviteGroupMember");
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

      <StyledView className="flex-1 justify-center items-center w-full ">
        <StyledView className="flex-row px-10">
          <ProfilePic />
        </StyledView>
        <StyledView className="flex-row px-10 p-4">
          <StyledText>UsER NAME</StyledText>
        </StyledView>

        {/* Separator */}
        <StyledView className="w-full h-[1px] my-4 bg-slate-400" />

        <StyledView className="flex-col pb-4">
          <StyledText className="mb-2">Groups:</StyledText>

          {/* Horizontal ScrollView for GroupPics */}
          <StyledView className="mt-2 w-full h-[200px]">
            <StyledScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1 ">
              {groupList.map((groupId: string, index: number) => {
                return (
                  <StyledView key={index} className="w-col px-2 items-center w-[125px] h-[200px]">
                    <GroupPic groupId={groupId} />
                    <StyledText className="p-2">Name</StyledText>
                  </StyledView>
                );
              })}
            </StyledScrollView>
          </StyledView>
        </StyledView>

        <StyledView className="flex-row px-10 mt-4">
          <ModalButton disabled={false} action={handleInvite} color={"bg-primary"} text="Invite friend" />
        </StyledView>
      </StyledView>

      <Link href="/home"></Link>
    </StyledView>
  );
});
