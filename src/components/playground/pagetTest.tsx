import React, { useRef, useEffect, useState } from "react";
import { FlatList, View, Dimensions, Platform } from "react-native";
import PagerView from "react-native-pager-view";
import { observer } from "@legendapp/state/react";
import { CanvasHolder } from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { GroupMember } from "@/src/types/shared.types";
import { pageStore$, pages$ } from "@/src/stores/PagesStore";
import ReactHolder from "../journal/reactions/ReactHolder";
import { reactStore$ } from "@/src/stores/ReactStore";
import { LOAD_MORE_PAGES, START_PAGE_NUM, getPageForUser, loadMorePages } from "@/src/services/Page";

// Get screen dimensions for dynamic sizing
const { width, height } = Dimensions.get("window");

const PageRenderer = observer(({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
  const userId = pageStore$.members.get()?.[rowIndex]?.user_id;
  const date = pageStore$.dates.get()?.[colIndex]?.date;
  const editMode = pageStore$.editMode.get();
  const active = rowIndex === pageStore$.curRow.get() && colIndex === pageStore$.curCol.get();
  const page = getPageForUser(pages$.get(), userId, date);
  // const reactEditMode = reactStore$.reactEditMode.get();
  return (
    <View key={`${rowIndex}-${colIndex}-${editMode && active ? "edit" : "view"}-${page?.id}`} style={{ width, height }}>
      <CanvasHolder pageId={page?.id} editMode={editMode && active} active={active} />
      {/* <ReactHolder pageId={page?.id} editMode={reactEditMode && active} /> */}
    </View>
  );
});

const VerticalPageList = observer(({ col, rows }: { col: number; rows: GroupMember[] }) => {
  const flatListRef = useRef<FlatList>(null);

  // Monitor scroll and update current row index
  useEffect(() => {
    const unsubscribe = pageStore$.curRow.onChange(({ value: scrollIndex }) => {
      if (flatListRef.current && scrollIndex >= 0 && col !== pageStore$.curCol.get()) {
        flatListRef.current.scrollToIndex({ index: scrollIndex, animated: false });
      }
    });
    return () => unsubscribe();
  }, [col]);

  // Viewable items handler
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0 && col === pageStore$.curCol.get()) {
      pageStore$.curRow.set(viewableItems[0].index);
    }
  };
  const initialRow = pageStore$.curRow.get();
  return (
    <FlatList
      key={`${col}`}
      ref={flatListRef}
      extraData={pageStore$.editMode.get()}
      data={rows}
      pagingEnabled
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={3}
      scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      // initialNumToRender={1}
      initialScrollIndex={initialRow}
      keyExtractor={(row) => `${row.user_id}-${col}`}
      renderItem={({ item: row, index }) => <PageRenderer rowIndex={index} colIndex={col} />}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50, waitForInteraction: false }}
      onScrollToIndexFailed={() => {
        console.log("failed to scroll");
      }}
    />
  );
});
// Outer parent component with PagerView
const Canvas2DScroller = observer(() => {
  console.log("re-render 2d canvas");
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      console.log("updating col", viewableItems[0].index);
      pageStore$.curCol.set(viewableItems[0].index);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={pageStore$.dates.get()}
        onViewableItemsChanged={onViewableItemsChanged}
        initialNumToRender={START_PAGE_NUM}
        maxToRenderPerBatch={LOAD_MORE_PAGES}
        windowSize={START_PAGE_NUM}
        onEndReachedThreshold={0.1}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // removeClippedSubviews={true}
        horizontal
        inverted
        onEndReached={async () => await loadMorePages()}
        renderItem={({ item, index }) => (
          <View key={`${item.date}`} style={{ flex: 1 }}>
            <VerticalPageList rows={pageStore$.members.get()} col={index} />
          </View>
        )}
        keyExtractor={(item, index) => `${item.date}`}
      />
      <JournalOverlays />
    </View>
  );
});

export default Canvas2DScroller;
