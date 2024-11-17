import React, { useRef, useEffect, useMemo } from "react";
import { FlatList, View, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
import { observer, useComputed } from "@legendapp/state/react";
import { CanvasHolder } from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { GroupMember } from "@/src/types/shared.types";
import { getPageForUser, loadMorePages, pageStore$, pages$ } from "@/src/stores/PagesStore";
import ReactHolder from "../journal/reactions/ReactHolder";
import { reactStore$ } from "@/src/stores/ReactStore";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import { jsonToCanvas } from "@/src/services/Canvas";

// Get screen dimensions for dynamic sizing
const { width, height } = Dimensions.get("window");

const PageRenderer = observer(({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
  const userId = pageStore$.members.get()?.[rowIndex]?.user_id;
  const date = pageStore$.dates.get()?.[colIndex]?.date;

  // Get current canvas directly from the stores
  const curRow = pageStore$.curRow.get();
  const curCol = pageStore$.curCol.get();
  const editMode = pageStore$.editMode.get();

  // Compute the active canvas based on conditions
  let canvas = defaultCanvas;
  if (editMode && curRow === rowIndex && curCol === colIndex) {
    const curCanvas = canvasStore$.curCanvas.get();
    canvas = curCanvas || defaultCanvas;
  } else if (userId && date) {
    const page = getPageForUser(userId, date);
    canvas = page?.canvas ? jsonToCanvas(page.canvas) || defaultCanvas : defaultCanvas;
  }
  console.log("cur canvas", rowIndex, colIndex, canvas);
  return (
    <View style={{ width, height }}>
      <CanvasHolder canvas={canvas} />
      {/* <ReactHolder canvas={canvas.get()} /> */}
    </View>
  );
});

// pageStore$.curRow.onChange(({ value: scrollIndex }) => {
//   if (flatListRef.current && scrollIndex >= 0 && col !== pageStore$.curCol.get()) {
//     flatListRef.current.scrollToIndex({ index: scrollIndex, animated: false });
//   }
// });

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
      ref={flatListRef}
      extraData={pageStore$.editMode.get()}
      data={rows}
      pagingEnabled
      scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      initialNumToRender={1}
      initialScrollIndex={pageStore$.curRow.get()}
      keyExtractor={(row) => `${row.user_id}-${col}`}
      renderItem={({ item: row, index }) => <PageRenderer rowIndex={index} colIndex={col} />}
      onScrollToIndexFailed={() => {}}
    />
  );
});
// Outer parent component with PagerView
const Canvas2DScroller = observer(() => {
  const pagerRef = useRef(null);

  const handlePagerChange = (e: any) => {
    const { position } = e.nativeEvent;
    if (pageStore$.dates.get().length - position <= 2) {
      loadMorePages();
    }
    pageStore$.curCol.set(position); // Update the current column index
  };

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        overdrag
        scrollEnabled={!pageStore$.editMode.get() && !reactStore$.reactEditMode.get()}
        layoutDirection={"rtl"}
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={handlePagerChange}>
        {pageStore$.dates.get().map((date, index) => (
          <View key={`${date}-${index}`} style={{ flex: 1 }}>
            <VerticalPageList rows={pageStore$.members.get()} col={index} />
          </View>
        ))}
      </PagerView>
      <JournalOverlays />
    </View>
  );
});

export default Canvas2DScroller;
