import GroupPic from "@/src/components/modals/GroupPic";
import ProfilePic from "@/src/components/modals/ProfilePic";
import EditableText from "@/src/components/shared/EditableText";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import UserPic from "@/src/components/shared/UserPic";
import authStore$ from "@/src/stores/AuthStore";
import { groups$ } from "@/src/stores/GroupStore";
import { groupMembers$ } from "@/src/stores/MemberStore";
import { pages$ } from "@/src/stores/PagesStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { GroupMember, Page } from "@/src/types/shared.types";
import { AntDesign, Feather } from "@expo/vector-icons";
import { observer } from "@legendapp/state/react";
import { Link, router } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
import Toast from "react-native-root-toast";

const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledFeather = styled(Feather);

const CurProfile = observer(function CurProfile() {
  const handleRemove = (userId: string) => {};
  const handleInvite = () => {
    router.push("./inviteGroupMember");
  };
  const curUserId = authStore$.session.get()?.user.id;
  if (!curUserId) return null;
  const profile = profiles$[curUserId].get();
  const groupsCount = groups$.get() ? Object.keys(groups$.get()).length : 0;
  const groupMembersCount = groupMembers$.get()
    ? Object.values(groupMembers$.get()).filter((item: GroupMember) => item.user_id !== curUserId).length
    : 0;
  const entriesCount = pages$.get()
    ? Object.values(pages$.get()).filter((item: Page) => item.created_by === curUserId).length
    : 0;
  const handleUpdateUsername = (val: string) => {
    profiles$[curUserId].username.set(val);
    Toast.show("name updated");
  };

  return (
    <StyledView className="flex-1 flex-col px-8 bg-[#F5EEE5]">
      <StyledView className="flex-1 justify-center items-center w-full ">
        <StyledView className="flex-row px-4">
          <ProfilePic editable />
        </StyledView>
        <StyledView className="flex-row  items-center px-10 p-4">
          {/* <StyledText>{profile.username || "Username"}</StyledText> */}
          {/* <StyledFeather name="edit-2" size={24} color="black" className="p-2" /> */}
          <EditableText placeholder={profile.username || "Username"} action={handleUpdateUsername} />
        </StyledView>

        {/* Separator */}
        <StyledView className="w-full h-[1px] my-4 bg-slate-400" />

        <StyledView className="flex-row justify-between pb-4 ">
          <StyledView className="flex-col flex-1 px-2 itmes-center">
            <StyledText className="font-bold">Groups</StyledText>
            <StyledText className="p-4 text-lg">{groupsCount}</StyledText>
          </StyledView>
          <StyledView className="flex-col flex-1 px-2 items-center">
            <StyledText className="font-bold">Friends</StyledText>
            <StyledText className="p-4 text-lg">{groupMembersCount}</StyledText>
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
