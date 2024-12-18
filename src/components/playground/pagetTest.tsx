import React, { useRef, useEffect, useState } from "react";
import { FlatList, View, Dimensions, Platform, ActivityIndicator, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { Memo, observer } from "@legendapp/state/react";
import { CanvasHolder } from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { GroupMember } from "@/src/types/shared.types";
import { pageStore$, pages$ } from "@/src/stores/PagesStore";
import ReactHolder from "../journal/reactions/ReactHolder";
import { reactStore$ } from "@/src/stores/ReactStore";
import { LOAD_MORE_PAGES, START_PAGE_NUM, getPageForUser, loadMorePages } from "@/src/services/Page";
import { styled } from "nativewind";
import LoadingScreen from "../screens/LoadingScreen";

// Get screen dimensions for dynamic sizing
const { width, height } = Dimensions.get("window");
const StyledText = styled(Text);
const StyledView = styled(View);

const PageRenderer = observer(({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
  const userId = pageStore$.members.get()?.[rowIndex]?.user_id;
  const date = pageStore$.dates.get()?.[colIndex]?.date;
  const active = rowIndex === pageStore$.curRow.get() && colIndex === pageStore$.curCol.get();
  //should only update edit mode if its active
  const editMode = pageStore$.editMode.get() && active;
  const page = getPageForUser(pages$.get(), userId, date);
  // console.log("active", active, rowIndex, colIndex);
  // const reactEditMode = reactStore$.reactEditMode.get();
  return (
    <View key={`${rowIndex}-${colIndex}-${editMode && active ? "edit" : "view"}-${page?.id}`} style={{ width, height }}>
      <CanvasHolder pageId={page?.id} editMode={editMode} active={active} />
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
  return (
    <FlatList
      key={`${col}`}
      ref={flatListRef}
      extraData={pageStore$.editMode.get()}
      data={rows}
      pagingEnabled
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      initialScrollIndex={pageStore$.curRow.get() || 0}
      keyExtractor={(row) => `${row.user_id}-${col}`}
      renderItem={({ item: row, index }) => <PageRenderer rowIndex={index} colIndex={col} />}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50, waitForInteraction: false }}
      onScrollToIndexFailed={() => {
        console.log("failed to scroll vertical");
      }}
      getItemLayout={(data, index) => ({
        length: height, // Replace with actual item height
        offset: height * index,
        index,
      })}
    />
  );
});
// Outer parent component with PagerView
const Canvas2DScroller = observer(() => {
  const listRef = useRef<FlatList>(null);
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      pageStore$.curCol.set(viewableItems[0].index);
    }
  };
  const handleEndReached = async () => {
    await loadMorePages();
  };
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={pageStore$.dates.get()}
        scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
        onViewableItemsChanged={onViewableItemsChanged}
        initialScrollIndex={pageStore$.curCol.get() || 0}
        onScrollToIndexFailed={({ index }) => {
          console.log("failed to scroll horizontal: ", index);
        }}
        initialNumToRender={14}
        maxToRenderPerBatch={7}
        windowSize={14}
        onEndReachedThreshold={0.3}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
        inverted
        onEndReached={handleEndReached}
        renderItem={({ item, index }) => (
          <View key={`${item.date}`} style={{ flex: 1 }}>
            <VerticalPageList rows={pageStore$.members.get()} col={index} />
          </View>
        )}
        keyExtractor={(item, index) => `${item.date}`}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        ListFooterComponent={
          <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
            <LoadingScreen />
          </View>
        }
      />
      <Memo>
        <JournalOverlays />
      </Memo>
    </View>
  );
});

export default Canvas2DScroller;
