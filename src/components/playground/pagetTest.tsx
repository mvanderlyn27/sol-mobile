import React, { useRef, useEffect, useMemo } from "react";
import { FlatList, View, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
import { observer, useComputed } from "@legendapp/state/react";
import { CanvasHolder } from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { Canvas, CanvasReaction, GroupMember, Reaction } from "@/src/types/shared.types";
import { getPageForUser, loadMorePages, pageStore$, pages$ } from "@/src/stores/PagesStore";
import ReactHolder from "../journal/reactions/ReactHolder";
import { editReactStore$, filterNonUserReactions, filterUserReactions, reactStore$ } from "@/src/stores/ReactStore";
import { canvasStore$, defaultCanvas } from "@/src/stores/CanvasStore";
import authStore$ from "@/src/stores/AuthStore";
import { jsonToCanvas } from "@/src/services/Canvas";

// Get screen dimensions for dynamic sizing
const { width, height } = Dimensions.get("window");

const PageRenderer = observer(({ rowIndex, colIndex }: { rowIndex: number; colIndex: number }) => {
  const userId = pageStore$.members.get()?.[rowIndex]?.user_id;
  const date = pageStore$.dates.get()?.[colIndex]?.date;
  const page = getPageForUser(userId, date);
  // Get current canvas directly from the stores
  const curRow = pageStore$.curRow.get();
  const curCol = pageStore$.curCol.get();
  const editMode = pageStore$.editMode.get();
  const curUserId = authStore$.session.user.id.get();
  const active = curRow === rowIndex && curCol === colIndex;
  // Compute the active canvas based on conditions
  let canvas = defaultCanvas;
  if (editMode && active) {
    const curCanvas = { ...canvasStore$.curCanvas.get() } as Canvas;
    canvas = curCanvas || defaultCanvas;
  } else if (userId && date) {
    canvas = page?.canvas ? (page.canvas as Canvas) || defaultCanvas : defaultCanvas;
  }
  let reactions: Reaction[] = [];
  const nonUserCanvasReactions = filterNonUserReactions(page?.id || "");
  const userCanvasReactions = filterUserReactions(page?.id || "");
  const reactEditMode = reactStore$.reactEditMode.get();
  const showReactions = reactStore$.showReactions.get();
  if (!reactEditMode && showReactions) {
    reactions = [...nonUserCanvasReactions, ...userCanvasReactions];
  } else if (reactEditMode && active) {
    const showEditNonUserReactions = editReactStore$.showNonUserReactions.get();
    const editUserReactions = editReactStore$.userReactions.get().map((reaction) => {
      return {
        created_at: new Date().toISOString(),
        created_by: curUserId,
        deleted: false,
        id: reaction.id,
        page_id: page?.id || "",
        reaction: reaction,
        updated_at: new Date().toISOString(),
      } as Reaction;
    });
    console.log("edits", editUserReactions);
    reactions = [...(showEditNonUserReactions ? nonUserCanvasReactions : []), ...editUserReactions];
  }
  return (
    <View style={{ width, height }}>
      <CanvasHolder canvas={canvas} />
      <ReactHolder reactions={reactions} />
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
