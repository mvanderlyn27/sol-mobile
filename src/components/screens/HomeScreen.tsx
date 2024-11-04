import { observer } from "@legendapp/state/react";
import { ScrollView, View } from "react-native";
import { Group } from "@/src/types/shared.types";
import GroupCard from "../home/GroupCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import HomeButtons from "../home/HomeButtons";
import CreateGroupButton from "../home/CreateGroupButton";
import { groups$ } from "@/src/stores/GroupStore";

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
  // const membersList: Member[] = [
  //   { avatar_url: "", id: "", name: "cool", group_id: "1" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "2" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "3" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "4" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "5" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "6" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "7" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "8" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "9" },
  //   { avatar_url: "", id: "", name: "cool", group_id: "10" },
  // ];

  // const exampleData = [
  //   {
  //     id: "1",
  //     name: "group 1",
  //     coverUrl: "",
  //     groupMembers: membersList,
  //   },
  //   {
  //     id: "2",
  //     name: "group 2",
  //     coverUrl: "",
  //     groupMembers: membersList,
  //   },
  //   {
  //     id: "3",
  //     name: "group 3",
  //     coverUrl: "",
  //     groupMembers: membersList,
  //   },
  //   // {
  //   //   id: "4",
  //   //   name: "group 3",
  //   //   coverUrl: "",
  //   //   groupMembers: membersList,
  //   // },
  // ];

  // Chunk the example data into rows with 2 items each
  const groupsMap = groups$.get();
  const groupAr = groupsMap ? Object.values(groupsMap) : [];
  const rows = chunkArray(groupAr, 2);
  console.log("groups", groups$.get());

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeButtons />
      <StyledScrollView className="flex-1">
        {rows.map((row, rowIndex) => (
          <StyledView key={rowIndex} className="flex-row justify-between mb-4">
            {row.map((group: Group, colIndex) => (
              <StyledView key={rowIndex + "-" + colIndex} style={{ width: "48%", height: 325 }}>
                <GroupCard group={group} />
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

        {(groupAr.length === 0 || rows[rows.length - 1]?.length === 2) && (
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
