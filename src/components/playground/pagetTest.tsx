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
import { debounce } from "lodash";
import { BlurView } from "expo-blur";
import { BackgroundImage } from "@rneui/themed/dist/config";
import { ImageBackground } from "expo-image";
import { getImageFromPath } from "@/src/assets/images/images";
import { appState$, initAppDimensions } from "@/src/services/AppStore";

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
  const reactEditMode = reactStore$.reactEditMode.get() && active;
  return (
    // <Memo>
    <View
      key={`${rowIndex}-${colIndex}${page ? "-" + page.updated_at : ""}-${editMode && active ? "edit" : "view"}-${
        page?.id
      }`}
      style={{ flex: 1 }}>
      <CanvasHolder pageId={page?.id} editMode={editMode} active={active} />
      {active && <ReactHolder pageId={page?.id} editMode={reactEditMode} />}
    </View>
    // </Memo>
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
  const onViewableItemsChanged = debounce(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && col === pageStore$.curCol.get()) {
      pageStore$.curRow.set(viewableItems[0].index);
    }
  }, 100);
  return (
    <FlatList
      key={`${col}`}
      ref={flatListRef}
      extraData={pageStore$.editMode.get()}
      data={rows}
      pagingEnabled
      initialNumToRender={5}
      maxToRenderPerBatch={3}
      windowSize={7}
      scrollEventThrottle={16} // Syncs scroll with 60fps
      // removeClippedSubviews={true} // Improves performance by removing off-screen components
      scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      initialScrollIndex={pageStore$.curRow.get() || 0}
      keyExtractor={(row) => `${row.user_id}-${col}`}
      renderItem={({ item: row, index }) => (
        <View
          style={{ width: appState$.adjustedWidth.get(), height: appState$.adjustedHeight.get(), overflow: "hidden" }}>
          <PageRenderer rowIndex={index} colIndex={col} />
        </View>
      )}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50, waitForInteraction: false }}
      onScrollToIndexFailed={() => {
        console.log("failed to scroll vertical");
      }}
      // getItemLayout={(data, index) => ({
      //   length: height, // Replace with actual item height
      //   offset: height * index,
      //   index,
      // })}
    />
  );
});
// Outer parent component with PagerView
const Canvas2DScroller = observer(() => {
  const listRef = useRef<FlatList>(null);
  const onViewableItemsChanged = debounce(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      pageStore$.curCol.set(viewableItems[0].index);
    }
  }, 100);
  initAppDimensions();
  console.log("adjusted", appState$.adjustedWidth.peek(), appState$.adjustedHeight.peek());
  console.log("nonadjusted", width, height);
  const handleEndReached = async () => {
    await loadMorePages();
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <BlurView
        tint="prominent"
        intensity={80}
        style={{
          backgroundColor: "#000",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View style={{ width: appState$.adjustedWidth.get(), height: appState$.adjustedHeight.get() }}>
        <FlatList
          style={{ flex: 1 }}
          ref={listRef}
          data={pageStore$.dates.get()}
          scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
          onViewableItemsChanged={onViewableItemsChanged}
          initialScrollIndex={pageStore$.curCol.get() || 0}
          onScrollToIndexFailed={({ index }) => {
            console.log("failed to scroll horizontal: ", index);
          }}
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={7}
          scrollEventThrottle={16} // Syncs scroll with 60fps
          // removeClippedSubviews={true} // Improves performance by removing off-screen components
          onEndReachedThreshold={0.5}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          horizontal
          inverted
          onEndReached={handleEndReached}
          renderItem={({ item, index }) => <VerticalPageList rows={pageStore$.members.get()} col={index} />}
          keyExtractor={(item, index) => `${item.date}`}
          // getItemLayout={(data, index) => ({
          //   length: width,
          //   offset: width * index,
          //   index,
          // })}
          ListFooterComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <LoadingScreen />
            </View>
          }
        />
      </View>
      <Memo>
        <JournalOverlays />
      </Memo>
      {/* </StyledView> */}
    </View>
  );
});

export default Canvas2DScroller;
