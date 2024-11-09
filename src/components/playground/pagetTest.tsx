import React from "react";
import { FlatList, View, Dimensions } from "react-native";
import { Show, observer } from "@legendapp/state/react";
import Canvas from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { getDateRange, getPageIdsForUser, journalStore$, pages$ } from "@/src/stores/PagesStore";
import { filterGroupMembers, groupMembers$ } from "@/src/stores/MemberStore";
import { jsonToCanvas } from "@/src/services/Canvas";
import authStore$ from "@/src/stores/AuthStore";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import { GroupMember } from "@/src/types/shared.types";
import { AnimatePresence, MotiView } from "moti";

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

  const renderCanvas = ({ item: [currentUser, date] }: { item: [string, string] }) => {
    const pageMap = pageData.get(currentUser);
    const pageId = pageMap?.get(date);
    const editMode = journalStore$.editMode.get();
    const pages = pages$.get();
    if (!pages) return null;
    const canvas = pages[pageId]?.canvas;
    const curCanvas = canvasStore$.curCanvas.get();

    return (
      <View style={{ flex: 1, width, height }}>
        <Canvas key={`view-${date}`} canvas={jsonToCanvas(JSON.stringify(canvas || "")) || defaultCanvas} />
      </View>
    );
  };

  const renderPagesForMember = ({ item: member }: { item: GroupMember }) => (
    <FlatList
      data={currentDates.map((date) => [member.user_id, date])} // Combine user ID and date pairs
      extraData={{
        editMode: journalStore$.editMode.get(),
        pageData: pageData,
        curCanvas: canvasStore$.curCanvas.get(),
      }}
      horizontal
      pagingEnabled
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
        extraData={{ editMode: journalStore$.editMode.get(), pageData: pageData }}
        pagingEnabled
        onViewableItemsChanged={({ viewableItems }) => handleUserChange(viewableItems)}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(member) => member.user_id}
        renderItem={renderPagesForMember}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        updateCellsBatchingPeriod={150}
        showsVerticalScrollIndicator={false}
      />
      {journalStore$.editMode.get() && (
        <Show if={journalStore$.editMode} wrap={AnimatePresence}>
          <MotiView
            key="edit-screen"
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "timing", duration: 300 }}>
            <Canvas canvas={canvasStore$.curCanvas.get() || defaultCanvas} />
          </MotiView>
        </Show>
      )}
      <JournalOverlays />
    </View>
  );
});

export default PagerTest;
