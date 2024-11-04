import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
// import { useJournalStore } from "@/src/stores/JournalStore";
import { styled } from "nativewind";
import CanvasHolder from "./canvas/Canvas";
// import { useBookStore } from "@/src/stores/BookStore";
// import Page from "@/src/localDb/models/Page";
import BottomBar from "./journalMenu/JournalMenu";
import { journalStore$, pages$ } from "@/src/stores/PagesStore";
import { Canvas, ImageType, Page } from "@/src/types/shared.types";
import { Json } from "@/src/types/supabase.types";
import { jsonToCanvas } from "@/src/services/Canvas";
import { addDays, format } from "date-fns";
import { observer } from "@legendapp/state/react";

const StyledView = styled(View);

export default observer(function JournalView() {
  //   const { editMode, initializeStore, pagesByDate, loadMorePages } = useJournalStore();
  //   const currentBook = useBookStore((state) => state.currentBook);
  const ref = useRef<PagerView>(null);
  //   const [pages, setPages] = useState<Page[]>([]);
  const pagesMap: Map<string, Page> = journalStore$.pageMap.get();
  console.log("pagesMap", pagesMap);
  const selectedDate = journalStore$.selectedDate.get();
  console.log("datelist", journalStore$.currentDates.get());

  const handlePageSelected = async (e: any) => {
    console.log("page selected", e.nativeEvent.position);
    const newPosition = e.nativeEvent.position;

    // Check if we need to add more dates
    const dateList = journalStore$.currentDates.get();
    journalStore$.selectedDate.set(dateList[newPosition]);
    if (dateList.length - newPosition - 3 <= 0) {
      console.log("adding days");
      const lastDay = dateList[dateList.length - 1]; // Get the last date in the list
      const newDates = Array(5)
        .fill(0)
        .map((_, i) => format(addDays(lastDay, -(i + 1)), "yyyy-MM-dd"));
      journalStore$.currentDates.set((entries: string[]) => [...entries, ...newDates]);
      console.log("after", journalStore$.currentDates.get());
    }
  };
  // Render a loading state until pages are available
  const getCanvas = (dateStr: string): Canvas => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
    const defaultCanvas = {
      backgroundImage: { path: "bg_04", type: ImageType.Local },
      items: [],
      screenWidth: screenWidth,
      screenHeight: screenHeight,
      curId: 0,
      maxZIndex: 0,
    };
    if (!pagesMap || !pagesMap.has(dateStr)) {
      console.log("missing page map");
      return defaultCanvas;
    }
    const page = pagesMap.get(dateStr);
    if (!page || !page.canvas) {
      console.log("error no page");
      return defaultCanvas;
    }
    const canvas: Canvas | null = jsonToCanvas(page.canvas.toString());
    if (!canvas) {
      console.log("no canvas");
      return defaultCanvas;
    }
    return canvas;
  };
  return (
    <StyledView className="flex-1">
      <PagerView
        scrollEnabled={!journalStore$.editMode.get()}
        ref={ref}
        style={{ flex: 1 }}
        layoutDirection="rtl"
        initialPage={0}
        onPageSelected={handlePageSelected}
        overdrag
        offscreenPageLimit={2}>
        {journalStore$.currentDates.get().map((date: string, index: React.Key | null | undefined) => (
          <StyledView key={index} className="flex-1" style={{ backgroundColor: "white" }}>
            <CanvasHolder canvas={getCanvas(date)} />
          </StyledView>
        ))}
      </PagerView>

      {/* other editing overlays can render here over the bottom bar, can also program bottom bar to hide */}
    </StyledView>
  );
});
