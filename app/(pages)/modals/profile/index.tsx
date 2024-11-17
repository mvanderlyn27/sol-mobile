import GroupPic from "@/src/components/modals/GroupPic";
import ProfilePic from "@/src/components/modals/ProfilePic";
import EditableText from "@/src/components/shared/EditableText";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import authStore$ from "@/src/stores/AuthStore";
import { groups$ } from "@/src/stores/GroupStore";
import { pages$ } from "@/src/stores/PagesStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { GroupMember, Page } from "@/src/types/shared.types";
import { AntDesign, Feather } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
import Toast from "react-native-root-toast";
import { useLocalSearchParams } from "expo-router";
import { filterMyGroups, filterOutPending, groupMembers$ } from "@/src/stores/MemberStore";
import { Share, Button } from "react-native";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const CurProfile = observer(function CurProfile() {
  const { back } = useLocalSearchParams();
  const handleRemove = (userId: string) => {};

  const curUserId = authStore$.session.get()?.user.id;
  if (!curUserId) return null;
  const profile = profiles$[curUserId].get();
  const myGroupIds = Object.values(filterMyGroups(groupMembers$.get(), curUserId) || {}).map((gm) => gm.group_id);
  const set = new Set([curUserId]);
  let friendCount = 0;
  Object.values(filterOutPending(groupMembers$.get()) || {}).forEach((groupMember) => {
    if (myGroupIds.includes(groupMember.group_id) && !set.has(groupMember.user_id)) {
      set.add(groupMember.user_id);
      friendCount += 1;
    }
  });
  const entriesCount = pages$.get()
    ? Object.values(pages$.get()).filter((item: Page) => item.created_by === curUserId).length
    : 0;
  const handleUpdateUsername = (val: string) => {
    profiles$[curUserId].username.set(val);
    Toast.show("name updated");
  };
  const handleInvite = async () => {
    try {
      const result = await Share.share({
        message: "Join my journal at https://sliceoflifeapp.com!",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Optional: Handle specific activity type if needed
        } else {
          // Shared successfully
        }
      } else if (result.action === Share.dismissedAction) {
        // Optional: Handle dismissal if needed
      }
    } catch (error) {
      console.error("Error sharing message:", error);
    }
  };

  return (
    <StyledView className="flex-1 flex-col px-8  bg-[#F5EEE5]">
      {back && (
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
      )}
      <StyledView className="flex-1  justify-center items-center w-full ">
        <StyledView className="flex-row px-14">
          <ProfilePic editable />
        </StyledView>
        <StyledView className="flex-row  items-center px-10 p-2">
          <EditableText placeholder={profile.username || "Username"} action={handleUpdateUsername} />
        </StyledView>
        {/* Separator */}
        <StyledView className="w-full h-[1px] my-2  bg-slate-400" />

        <StyledView className="flex-row justify-between pb-4 ">
          <StyledView className="flex-col flex-1 px-2 itmes-center">
            <StyledText className="font-bold">Groups</StyledText>
            <StyledText className="p-4 text-lg">{myGroupIds.length || 0}</StyledText>
          </StyledView>
          <StyledView className="flex-col flex-1 px-2 items-center">
            <StyledText className="font-bold">Friends</StyledText>
            <StyledText className="p-4 text-lg">{friendCount}</StyledText>
          </StyledView>
          <StyledView className="flex-col flex-1 px-2 items-center">
            <StyledText className="font-bold">Entries</StyledText>
            <StyledText className="p-4 text-lg">{entriesCount}</StyledText>
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
export default CurProfile;
