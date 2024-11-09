import React, { useMemo, useCallback } from "react";
import { FlatList, View, Dimensions } from "react-native";
import { observer } from "@legendapp/state/react";
import Canvas from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { getDateRange, getPageIdsForUser, journalStore$, pages$ } from "@/src/stores/PagesStore";
import { filterGroupMembers, groupMembers$ } from "@/src/stores/MemberStore";
import { jsonToCanvas } from "@/src/services/Canvas";
import authStore$ from "@/src/stores/AuthStore";
import { GroupMember, ImageType } from "@/src/types/shared.types";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import { AnimatePresence, MotiView } from "moti";

const { width, height } = Dimensions.get("window");
const PagerTest = observer(({ groupId }) => {
  const currentDates = useMemo(() => getDateRange(), []);
  const user = authStore$.session.get()?.user;

  const members = useMemo(() => {
    const filteredMembers = Object.values(filterGroupMembers(groupMembers$.get(), groupId) || {});
    return filteredMembers.sort((a, b) => (a.user_id === user?.id ? -1 : b.user_id === user?.id ? 1 : 0));
  }, [groupId, user?.id]);

  const pageData = useMemo(() => {
    const data = new Map();
    members.forEach((member) => {
      data.set(member.user_id, getPageIdsForUser(member.user_id, pages$.get()) || new Map());
    });
    return data;
  }, [members]);

  const handleUserChange = useCallback(
    ({ viewableItems }: any) => {
      const newIndex = viewableItems[0]?.index || 0;
      const userId = members[newIndex]?.user_id;
      journalStore$.currentUser.set(userId);
    },
    [members]
  );

  const handlePageChange = useCallback(
    ({ viewableItems }: any) => {
      const lastIndex = viewableItems[0]?.index;
      if (lastIndex === undefined) return;

      const date = currentDates[lastIndex];
      journalStore$.currentDate.set(date);
      const currentUser = journalStore$.currentUser.get();
      const pageMap = currentUser ? pageData.get(currentUser) : new Map();
      const pageId = pageMap?.get(date);
      journalStore$.currentPageId.set(pageId);

      const loadedDays = journalStore$.loadedDates.get();
      if (loadedDays - lastIndex < 2) {
        console.log("loading more data");
        journalStore$.loadedDates.set(loadedDays + 7);
      }
    },
    [pageData, currentDates, journalStore$.loadedDates, members]
  );

  const renderCanvas = useCallback(
    ({ item: combinedData }: { item: [string, string] }) => {
      const currentUser = combinedData[0];
      const date = combinedData[1];
      const pageMap = currentUser ? pageData.get(currentUser) : new Map();
      const pageId = pageMap?.get(date);
      if (!pages$.get()) return null;
      const canvas = pages$.get()[pageId]?.canvas;

      const editMode = journalStore$.editMode.get();
      const curCanvas = canvasStore$.curCanvas.get(); // Reactively track `curCanvas`
      return (
        <View style={{ flex: 1, width, height }}>
          {editMode && <Canvas key={`edit-${date}`} canvas={curCanvas || defaultCanvas} />}
          {!editMode && (
            <Canvas key={`view-${date}`} canvas={jsonToCanvas(JSON.stringify(canvas || "")) || defaultCanvas} />
          )}
        </View>
      );
    },
    [pageData, journalStore$.currentUser.get(), journalStore$.editMode.get(), canvasStore$.curCanvas.get()] // Include reactive values in dependencies
  );
  const combineMemberDate = (member: string, dates: string[]): [string, string][] => {
    return dates.map((date) => [member, date]);
  };
  const renderPagesForMember = useCallback(
    ({ item: member }: { item: GroupMember }) => (
      <FlatList
        data={combineMemberDate(member.user_id, currentDates)}
        horizontal
        pagingEnabled
        inverted
        onViewableItemsChanged={handlePageChange}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(page, index) => `${member.id}_page_${index}`}
        renderItem={renderCanvas}
        initialNumToRender={3} // Render only a few items initially
        maxToRenderPerBatch={2} // Limit re-renders to avoid overloading
        updateCellsBatchingPeriod={100} // Adjust batch period for smoother scrolling
        showsHorizontalScrollIndicator={false}
      />
    ),
    [currentDates, handlePageChange]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={members}
        pagingEnabled
        onViewableItemsChanged={handleUserChange}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(member) => member.user_id}
        renderItem={renderPagesForMember}
        initialNumToRender={1} // Initially render only one member's pages
        maxToRenderPerBatch={1} // Limit to avoid lag
        updateCellsBatchingPeriod={150}
        showsVerticalScrollIndicator={false}
      />
      <JournalOverlays />
    </View>
  );
});

export default PagerTest;
