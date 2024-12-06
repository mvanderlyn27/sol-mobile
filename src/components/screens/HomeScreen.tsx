import { observer } from "@legendapp/state/react";
import { ScrollView, View } from "react-native";
import { Group } from "@/src/types/shared.types";
import GroupCard from "../home/GroupCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import HomeButtons from "../home/HomeButtons";
import CreateGroupButton from "../home/CreateGroupButton";
import authStore$ from "@/src/stores/AuthStore";
import { groups$ } from "@/src/stores/GroupStore";
import { filterMyGroups, filterMyInvites } from "@/src/services/Group";
import { groupMembers$ } from "@/src/stores/MemberStore";

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

// Helper function to chunk data into rows with 2 items per row

const HomeScreen = observer(function HomeScreen() {
  function chunkArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
  const curUserId = authStore$.session.get()?.user.id;
  // Get the group IDs from myGroups and myInvites
  const myGroupsIds = Object.values(filterMyGroups(groupMembers$.get(), curUserId || "") || {}).map(
    (groupMember) => groupMember.group_id
  );

  const myInvitesIds = Object.values(filterMyInvites(groupMembers$.get(), curUserId || "") || {}).map(
    (groupMember) => groupMember.group_id
  );
  console.log("group ids", myGroupsIds);
  console.log("my invites", myInvitesIds);
  // Retrieve the map of groups
  const groups = groups$.get();
  // console.log("groups", groups);
  // Create an array of GroupMember from groups based on myGroups and myInvites
  const myGroupMembersArray = groups
    ? Object.entries(groups).reduce((acc: Group[], [groupId, group]) => {
        // Check if the groupId is in myGroups or myInvites
        if (myGroupsIds.includes(groupId) || myInvitesIds.includes(groupId)) {
          // Assuming that each group has a corresponding GroupMember object, add it to the array
          acc.push({ ...group, group_id: groupId }); // Adjust based on your actual GroupMember structure
        }
        return acc;
      }, [])
    : [];
  // Chunk the array into rows with 2 items each
  const rows = chunkArray(myGroupMembersArray, 2);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeButtons />
      <StyledScrollView className="flex-1 px-4">
        {rows.map((row, rowIndex: number) => (
          <StyledView key={rowIndex} className="flex-row justify-between mt-4 mb-4">
            {row.map((group: any, colIndex: number) => (
              <StyledView key={`${rowIndex}-${colIndex}`} style={{ width: "47%", height: 300 }}>
                <GroupCard group={group} invitation={myInvitesIds.includes(group.id)} />
              </StyledView>
            ))}
            {/* Render an additional CreateGroupButton if this is the last row and it has only one item */}
            {row.length === 1 && (
              <StyledView style={{ width: "47%", height: 300 }}>
                <CreateGroupButton />
              </StyledView>
            )}
          </StyledView>
        ))}

        {/* Add CreateGroupButton in case there are no groups or the last row is full */}
        {(rows.length === 0 || rows[rows.length - 1]?.length === 2) && (
          <StyledView key={"create"} className="flex-row justify-between mb-4">
            <StyledView style={{ width: "47%", height: 300 }}>
              <CreateGroupButton />
            </StyledView>
          </StyledView>
        )}
      </StyledScrollView>
    </SafeAreaView>
  );
});

export default HomeScreen;
