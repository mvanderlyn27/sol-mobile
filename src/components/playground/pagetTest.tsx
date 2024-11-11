import React from "react";
import { FlatList, View, Dimensions } from "react-native";
import { Show, observer } from "@legendapp/state/react";
import JournalOverlays from "../journal/JournalOverlays";
import { getDateRange, getPageIdsForUser, journalStore$, pages$ } from "@/src/stores/PagesStore";
import { filterGroupMembers, groupMembers$ } from "@/src/stores/MemberStore";
import { jsonToCanvas } from "@/src/services/Canvas";
import authStore$ from "@/src/stores/AuthStore";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import { GroupMember } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";
import CanvasHolder from "../journal/canvas/Canvas";

const { width, height } = Dimensions.get("window");

const PagerTest = observer(({ groupId }) => {
  const currentDates = getDateRange();
  const user = authStore$.session.get()?.user;

  // Automatically updates when `groupMembers$` or `authStore$` changes
  const members = Object.values(filterGroupMembers(groupMembers$.get(), groupId) || {})?.sort(
    (a: GroupMember, b: GroupMember) => (a.user_id === user?.id ? -1 : b.user_id === user?.id ? 1 : 0)
  );

  // Observing the entire page data structure, automatically updated with `pages$`
  const pageData = new Map();
  members.forEach((member) => {
    pageData.set(member.user_id, getPageIdsForUser(member.user_id, pages$.get()) || new Map());
  });

  // Reactively track changes in current date or user
  const handleUserChange = (viewableItems: any) => {
    const newIndex = viewableItems[0]?.index || 0;
    const userId = members[newIndex]?.user_id;
    journalStore$.currentUser.set(userId);
  };

  const handlePageChange = (viewableItems: any) => {
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
  };
  type CombinedItem = {
    currentUser: string;
    date: string;
  };
  const renderCanvas = ({ item: { currentUser, date } }: { item: CombinedItem }) => {
    const pageMap = pageData.get(currentUser);
    const pageId = pageMap?.get(date);
    return (
      <View key={`view-${date}`} style={{ flex: 1, width, height }}>
        <CanvasHolder key={`view-${date}`} pageId={pageId} />
      </View>
    );
  };

  const renderPagesForMember = ({ item: member }: { item: GroupMember }) => (
    <FlatList
      data={currentDates.map((date) => {
        return {
          currentUser: member.user_id,
          date: date,
        };
      })}
      horizontal
      pagingEnabled
      scrollEnabled={!journalStore$.editMode.get()}
      inverted
      onViewableItemsChanged={({ viewableItems }) => handlePageChange(viewableItems)}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      keyExtractor={(page, index) => `${member.id}_page_${index}`}
      renderItem={renderCanvas}
      initialNumToRender={3}
      maxToRenderPerBatch={2}
      updateCellsBatchingPeriod={100}
      showsHorizontalScrollIndicator={false}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={members}
        pagingEnabled
        scrollEnabled={!journalStore$.editMode.get()}
        onViewableItemsChanged={({ viewableItems }) => handleUserChange(viewableItems)}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(member) => member.user_id}
        renderItem={renderPagesForMember}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        updateCellsBatchingPeriod={150}
        showsVerticalScrollIndicator={false}
      />
      <JournalOverlays />
    </View>
  );
});

export default PagerTest;
