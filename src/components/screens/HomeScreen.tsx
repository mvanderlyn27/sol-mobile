import { observer } from "@legendapp/state/react";
import { ScrollView, View } from "react-native";
import { Group } from "@/src/types/shared.types";
import GroupCard from "../home/GroupCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import HomeButtons from "../home/HomeButtons";
import CreateGroupButton from "../home/CreateGroupButton";
import { groups$, myGroups$, myPendingGroups$ } from "@/src/stores/GroupStore";
import { myGroupMemberships$, myPendingGroupMembers$ } from "@/src/stores/MemberStore";

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);

// Helper function to chunk data into rows with 2 items per row
function chunkArray(array: any[], size: number) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const HomeScreen = observer(function HomeScreen() {
  // Retrieve the map of groups and convert it to an array with ids
  const myGroupInvites = myPendingGroups$.get();
  const myGroups = myGroups$.get();
  const myGroupArray = myGroups ? Object.entries(myGroups).map(([id, group]) => ({ ...group, id })) : [];
  const groupInvitationArray = myGroupInvites
    ? Object.entries(myGroupInvites).map(([id, group]) => ({ ...group, id }))
    : [];

  // Chunk the array into rows with 2 items each
  const rows = chunkArray([...groupInvitationArray, ...myGroupArray], 2);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeButtons />
      <StyledScrollView className="flex-1">
        {rows.map((row, rowIndex: number) => (
          <StyledView key={rowIndex} className="flex-row justify-between mb-4">
            {row.map((group: any, colIndex: number) => (
              <StyledView key={`${rowIndex}-${colIndex}`} style={{ width: "48%", height: 325 }}>
                <GroupCard group={group} invitation={groupInvitationArray.includes(group)} />
              </StyledView>
            ))}
            {/* Render an additional CreateGroupButton if this is the last row and it has only one item */}
            {row.length === 1 && (
              <StyledView style={{ width: "48%", height: 325 }}>
                <CreateGroupButton />
              </StyledView>
            )}
          </StyledView>
        ))}

        {/* Add CreateGroupButton in case there are no groups or the last row is full */}
        {(rows.length === 0 || rows[rows.length - 1]?.length === 2) && (
          <StyledView key={"create"} className="flex-row justify-between mb-4">
            <StyledView style={{ width: "48%", height: 325 }}>
              <CreateGroupButton />
            </StyledView>
          </StyledView>
        )}
      </StyledScrollView>
    </SafeAreaView>
  );
});

export default HomeScreen;
