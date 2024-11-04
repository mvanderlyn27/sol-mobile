import GroupPic from "@/src/components/modals/GroupPic";
import MemberList from "@/src/components/modals/MemberList";
import ProfilePic from "@/src/components/profile/ProfilePic";
import ModalButton from "@/src/components/shared/ModalButton";
import RectangleButton from "@/src/components/shared/RectangleButton";
import { Link, router, useLocalSearchParams } from "expo-router";
import { styled } from "nativewind";
import { View, Text, Dimensions, Pressable } from "react-native";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
export default function GroupInvitation() {
  const group_id = useLocalSearchParams().id;
  const membersList = [
    { avatar_url: "", id: "1", name: "cool", group_id: "" },
    { avatar_url: "", id: "2", name: "cool", group_id: "" },
    { avatar_url: "", id: "3", name: "cool", group_id: "" },
    { avatar_url: "", id: "4", name: "cool", group_id: "" },
    { avatar_url: "", id: "5", name: "cool", group_id: "" },
    { avatar_url: "", id: "6", name: "cool", group_id: "" },
    { avatar_url: "", id: "7", name: "cool", group_id: "" },
    { avatar_url: "", id: "8", name: "cool", group_id: "" },
    { avatar_url: "", id: "9", name: "cool", group_id: "" },
    { avatar_url: "", id: "10", name: "cool", group_id: "" },
  ];
  const handleEdit = () => {
    router.push("./editGroupMembers");
  };
  const handleInvite = () => {
    router.push("./inviteGroupMember");
  };
  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: "#F5EEE5" }}>
      <StyledView className="pt-10 flex-col justify-center items-center flex-1">
        <StyledView className="flex-row h-[250px] px-10">
          <GroupPic />
        </StyledView>
        <StyledText>{group_id}</StyledText>
        <MemberList members={membersList} />
        <StyledView className="flex-row px-4 pb-4 justify-between">
          <ModalButton
            action={handleEdit}
            color="bg-black"
            text="Edit Members"
            disabled={false}
            textColor={"text-white"}
          />
          <ModalButton
            action={handleInvite}
            color="bg-primary"
            text="Invite New"
            disabled={false}
            textColor={"text-white"}
          />
        </StyledView>
      </StyledView>
    </View>
  );
}
