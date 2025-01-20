import React, { useRef, useEffect, useState } from "react";
import { FlatList, View, Dimensions, Platform, ActivityIndicator, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { Memo, observer, useIsMounted, useMount, useMountOnce } from "@legendapp/state/react";
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
import { appState$, initAppDimensions } from "@/src/services/AppStore";
// Get screen dimensions for dynamic sizing
const { width, height } = Dimensions.get("window");
const StyledText = styled(Text);
const StyledView = styled(View);

const PageRenderer = observer(({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
  // useTraceUpdates();
  const userId = pageStore$.members.get()?.[rowIndex]?.user_id;
  const date = pageStore$.dates.get()?.[colIndex]?.date;
  const active = rowIndex === pageStore$.curRow.get() && colIndex === pageStore$.curCol.get();
  // const active = Math.abs(rowIndex - pageStore$.curRow.get()) < 2 && Math.abs(colIndex - pageStore$.curCol.get()) < 2;
  //should only update edit mode if its active
  const editMode = pageStore$.editMode.get() && active;
  const page = getPageForUser(pages$.get() || {}, userId, date);
  const reactEditMode = reactStore$.reactEditMode.get() && active;
  return (
    <View key={`${rowIndex}-${colIndex}-${editMode && active ? "edit" : "view"}-${page?.id}`} style={{ flex: 1 }}>
      <CanvasHolder pageId={page?.id} editMode={editMode} active={active} />
      {active && <ReactHolder pageId={page?.id} editMode={reactEditMode} />}
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
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      scrollEventThrottle={16} // Syncs scroll with 60fps
      removeClippedSubviews={true} // Improves performance by removing off-screen components
      scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      initialScrollIndex={pageStore$.curRow.get() || 0}
      keyExtractor={(row) => `${row.user_id}-${col}`}
      renderItem={({ item: row, index }) => (
        <View
          style={{
            // justifyContent: "center",
            // alignItems: "center",
            width: appState$.adjustedWidth.get(),
            height: appState$.adjustedHeight.get(),
            overflow: "hidden",
          }}>
          <PageRenderer rowIndex={index} colIndex={col} />
          {/* <Text>{row.user_id}</Text> */}
        </View>
      )}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50, waitForInteraction: false }}
      onScrollToIndexFailed={() => {
        console.log("failed to scroll vertical");
      }}
      getItemLayout={(data, index) => ({
        length: appState$.adjustedHeight.get(), // Replace with actual item height
        offset: appState$.adjustedHeight.get() * index,
        index,
      })}
    />
  );
});
// });
// Outer paent component with PagerView
const Canvas2DScroller = observer(() => {
  const listRef = useRef<FlatList>(null);
  // const onViewableItemsChanged = debounce(({ viewableItems }) => {
  //   if (viewableItems.length > 0) {
  //     pageStore$.curCol.set(viewableItems[0].index);
  //   }
  // }, 200);
  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      pageStore$.curCol.set(viewableItems[0].index);
    }
  };
  useMountOnce(() => {
    initAppDimensions();
  });
  const handleEndReached = async () => {
    await loadMorePages();
  };

  // console.log("test data", test$.get());
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
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          scrollEventThrottle={16} // Syncs scroll with 60fps
          removeClippedSubviews={true} // Improves performance by removing off-screen components
          onEndReachedThreshold={0.5}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          horizontal
          inverted
          onEndReached={handleEndReached}
          renderItem={({ item, index }) => <VerticalPageList rows={pageStore$.members.get()} col={index} />}
          keyExtractor={(item, index) => `${item.date}`}
          getItemLayout={(data, index) => ({
            length: appState$.adjustedWidth.get(),
            offset: appState$.adjustedWidth.get() * index,
            index,
          })}
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
