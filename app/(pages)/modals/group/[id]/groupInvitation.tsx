import GroupPic from "@/src/components/modals/GroupPic";
import MemberList from "@/src/components/modals/MemberList";
import ProfilePic from "@/src/components/profile/ProfilePic";
import EditableText from "@/src/components/shared/EditableText";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import { supabase } from "@/src/lib/supabase";
import { acceptInvite, declineInvite, filterMyInvites } from "@/src/services/Group";
import authStore$ from "@/src/stores/AuthStore";
import { groups$ } from "@/src/stores/GroupStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { observer } from "@legendapp/state/react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const ensureNotArray = (input: string | string[]) => {
  if (Array.isArray(input)) {
    return input[0];
  }
  return input;
};
const GroupDetails = observer(function GroupDetails() {
  let group_id = ensureNotArray(useLocalSearchParams().id);

  const selectedGroup = groups$[group_id].get();
  if (!selectedGroup) {
    router.navigate("/home");
    return;
  }
  const userId = authStore$.session.get()?.user.id;
  const inviteId = Object.entries(filterMyInvites(groupMembers$.get() || {}, userId || "") || {}).find(
    ([, invite]) => invite.group_id === group_id && invite.user_id === userId
  )?.[0];
  if (!inviteId) {
    return null;
  }
  const handleAccept = async () => {
    // Update the Legend State observable with the fetched data
    acceptInvite(inviteId);
    router.navigate("/home");
  };
  const handleDecline = async () => {
    // Update the Legend State observable with the fetched data
    declineInvite(inviteId);
    router.navigate("/home");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5EEE5" }}>
      <StyledView className="pt-4 flex-col justify-center items-center flex-1">
        <StyledView className="flex-row flex-1 px-20">
          <GroupPic groupId={selectedGroup.id} />
        </StyledView>
        <StyledView className="flex-row flex-none px-10">
          <StyledText className="font-bold text-md py-2">{selectedGroup.name}</StyledText>
        </StyledView>
        <StyledView className="px-8 w-full h-[150px] flex-none justify-between">
          <MemberList groupId={selectedGroup.id} />
        </StyledView>
        <StyledView className="flex-row flex-none  px-8 pb-4 justify-between">
          <ModalButton
            action={handleDecline}
            color="bg-red-500"
            text="Decline"
            disabled={false}
            textColor={"text-white"}
          />
          <ModalButton
            action={handleAccept}
            color="bg-primary"
            text="Accept"
            disabled={false}
            textColor={"text-white"}
          />
        </StyledView>
      </StyledView>
    </View>
  );
});
export default GroupDetails;
