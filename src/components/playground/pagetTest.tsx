import React, { useRef, useEffect } from "react";
import { FlatList, View, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
import { observer } from "@legendapp/state/react";
import { CanvasHolder } from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { GroupMember } from "@/src/types/shared.types";
import { initializePageStore, loadMorePages, pageStore$ } from "@/src/stores/PagesStore";
import ReactHolder from "../journal/reactions/ReactHolder";
import { reactStore$ } from "@/src/stores/ReactStore";

// Get screen dimensions for dynamic sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Render vertical list of pages for a user (within each pager page)
const VerticalPageList = observer(({ col, rows }: { col: number; rows: GroupMember[] }) => {
  const flatListRef = useRef<FlatList>(null);

  // Scroll to the correct row index whenever the pageStore$.curRow changes
  pageStore$.curRow.onChange(({ value: scrollIndex }) => {
    if (flatListRef.current && scrollIndex >= 0 && col !== pageStore$.curCol.get()) {
      flatListRef.current.scrollToIndex({ index: scrollIndex, animated: false });
    }
  });

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0 && col === pageStore$.curCol.get()) {
      const curIndex = viewableItems[0].index;
      pageStore$.curRow.set(curIndex); // Update current row index in store
      //maybe update user here for faster shift
    }
  };

  return (
    <FlatList
      ref={flatListRef}
      data={rows}
      pagingEnabled
      scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      initialNumToRender={3}
      initialScrollIndex={pageStore$.curRow.get()}
      keyExtractor={(row) => `${row.user_id}-${col}`}
      renderItem={({ item: row, index }) => (
        <View style={{ width: screenWidth, height: screenHeight }}>
          <CanvasHolder row={index} col={col} />
          <ReactHolder row={index} col={col} />
        </View>
      )}
      onScrollToIndexFailed={() => {}}
    />
  );
});

// Outer parent component with PagerView
const Canvas2DScroller = observer(() => {
  const pagerRef = useRef(null);

  // Handle scroll events in the PagerView
  const handlePagerChange = (e: any) => {
    const { position } = e.nativeEvent;
    if (pageStore$.dates.get().length - position <= 2) {
      loadMorePages();
    }
    pageStore$.curCol.set(position); // Update the current column (page) index
    // Optionally load more dates here if needed
  };

  return (
    <View style={{ flex: 1 }}>
      {/* PagerView as the parent container */}
      <PagerView
        overdrag
        scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
        layoutDirection={"rtl"}
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePagerChange} // Sync with the selected pager page
      >
        {/* Loop through dates to create a page for each */}
        {pageStore$.dates.get().map((date, index) => (
          <View key={`${date}-${index}`} style={{ flex: 1 }}>
            <VerticalPageList rows={pageStore$.members.get()} col={index} />
          </View>
        ))}
      </PagerView>

      {/* Overlays */}
      <JournalOverlays />
    </View>
  );
});

export default Canvas2DScroller;
