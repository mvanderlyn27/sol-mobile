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
import { ButtonType, GroupMember, NotificationType, Page } from "@/src/types/shared.types";
import { AntDesign, Feather } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Share, Button } from "react-native";
import { generateId } from "@/src/stores/AsyncStorage";
import { addNotification } from "@/src/stores/NotificationStore";
import { filterMyGroups, filterOutPending } from "@/src/services/Group";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { useState } from "react";
import UsernameInput from "@/src/components/modals/UsernameInput";
import ModalIconButton from "@/src/components/shared/ModalIconButton";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const CurProfile = observer(function CurProfile() {
  const [loading, setLoading] = useState(false);
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
  const entriesCount =
    Object.values((pages$.get() as Record<string, Page>) || {}).filter((item: Page) => item.created_by === curUserId)
      ?.length || 0;

  const handleInvite = async (type: string) => {
    try {
      const url =
        type === "android"
          ? "https://play.google.com/apps/internaltest/4700953126034984120"
          : "https://testflight.apple.com/join/MajqukKt";
      const result = await Share.share({
        message: `Hey! I wanted to invite you to the Slice of Life Beta. Join here:\n${url}`,
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
          <UsernameInput disabled={loading} />
        </StyledView>
        {/* Separator */}
        <StyledView className="w-full h-[1px] my-2  bg-slate-400" />

        <StyledView className="flex-row justify-between pb-4 ">
          <StyledView className="flex-col flex-1 px-2 items-center">
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

        <StyledView className="flex-row  my-2">
          <ModalIconButton
            disabled={false}
            action={() => handleInvite("ios")}
            color={"bg-primary"}
            text="Invite friend"
            buttonType={ButtonType.IOS}
          />
          <ModalIconButton
            disabled={false}
            action={() => handleInvite("android")}
            color={"bg-primary"}
            text="Invite friend"
            buttonType={ButtonType.Android}
          />
        </StyledView>
      </StyledView>
    </StyledView>
  );
});
export default CurProfile;
