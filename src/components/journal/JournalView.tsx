import React, { useEffect, useRef, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import PagerView from "react-native-pager-view";
// import { useJournalStore } from "@/src/stores/JournalStore";
import { styled } from "nativewind";
import CanvasHolder from "./canvas/Canvas";
// import { useBookStore } from "@/src/stores/BookStore";
// import Page from "@/src/localDb/models/Page";
import BottomBar from "./bottomBar/BottomBar";
import { journalStore$, pages$ } from "@/src/stores/JournalStore";
import { Canvas, ImageType } from "@/src/types/shared.types";
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
  const pagesMap = journalStore$.pages.get();
  console.log(pagesMap);
  const selectedDate = journalStore$.selectedDate.get();
  // Load initial pages and set loading state
  //   useEffect(() => {
  //     // if (!currentBook) return;
  //     const loadPages = async () => {
  //       setLoading(true);
  //     //   await initializeStore();
  //       setLoading(false);
  //     };
  //     loadPages();
  //   }, [currentBook]);

  // Convert pagesByDate to a sorted array and set to pages
  //   useEffect(() => {
  //     const pagesAr = Object.values(pagesByDate)
  //       .filter((page): page is Page => page !== null) // Filter out null values
  //       .sort((a, b) => b.date.localeCompare(a.date)); //reverse  Sort by date
  //     setPages(pagesAr);
  //   }, [pagesByDate]);

  // Use state for dateList

  const handlePageSelected = async (e: any) => {
    console.log("page selected", e.nativeEvent.position);
    const newPosition = e.nativeEvent.position;

    // Check if we need to add more dates
    const dateList = journalStore$.currentDates.get();
    if (dateList.length - newPosition - 3 <= 0) {
      console.log("adding days");
      const lastDay = dateList[dateList.length - 1]; // Get the last date in the list
      const newDates = Array(5)
        .fill(0)
        .map((_, i) => format(addDays(new Date(lastDay), i + 1), "yyyy-MM-dd"));
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
    if (pagesMap[dateStr]) {
      const canvasStr = pagesMap[dateStr];
      let canvas = jsonToCanvas(canvasStr);
      if (canvas) {
        return canvas;
      } else {
        console.log("error no canvas");
      }
    }
    return defaultCanvas;
  };
  return (
    <StyledView className="flex-1">
      <PagerView
        // scrollEnabled={!editMode}
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
      <BottomBar />
      {/* other editing overlays can render here over the bottom bar, can also program bottom bar to hide */}
    </StyledView>
  );
});
