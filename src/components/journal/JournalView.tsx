import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { useJournalStore } from "@/src/stores/JournalStore";
import { styled } from "nativewind";
import CanvasHolder from "./canvas/Canvas";
import { useBookStore } from "@/src/stores/BookStore";
import Page from "@/src/localDb/models/Page";
import BottomBar from "./bottomBar/BottomBar";

const StyledView = styled(View);

export default function JournalView() {
  const { editMode, initializeStore, pagesByDate, loadMorePages } = useJournalStore();
  const currentBook = useBookStore((state) => state.currentBook);
  const ref = useRef<PagerView>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial pages and set loading state
  useEffect(() => {
    if (!currentBook) return;
    const loadPages = async () => {
      setLoading(true);
      await initializeStore();
      setLoading(false);
    };
    loadPages();
  }, [currentBook]);

  // Convert pagesByDate to a sorted array and set to pages
  useEffect(() => {
    const pagesAr = Object.values(pagesByDate)
      .filter((page): page is Page => page !== null) // Filter out null values
      .sort((a, b) => b.date.localeCompare(a.date)); //reverse  Sort by date
    setPages(pagesAr);
  }, [pagesByDate]);

  const handlePageSelected = async (e: any) => {
    console.log("page selected", e.nativeEvent.position);
    const newPosition = e.nativeEvent.position;
    // Check if the user is nearing the end of the available pages
    if (newPosition >= pages.length - 2) {
      await loadMorePages(); // This will add more pages to the store
      //need to figure out a check for if the store is too large to shrink it, without messing up the positioning?
    }
  };
  // Render a loading state until pages are available
  if (loading) {
    return (
      <StyledView className="flex-1" style={{ backgroundColor: "blue" }}>
        <Text>Loading...</Text>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1">
      <PagerView
        scrollEnabled={!editMode}
        ref={ref}
        style={{ flex: 1 }}
        layoutDirection="rtl"
        initialPage={0}
        onPageSelected={handlePageSelected}
        overdrag
        offscreenPageLimit={2}>
        {pages.map((page, index) => (
          <StyledView key={page.date + "-" + index} className="flex-1" style={{ backgroundColor: "white" }}>
            <CanvasHolder canvas={page.canvas} />
          </StyledView>
        ))}
      </PagerView>
      <BottomBar />
      {/* other editing overlays can render here over the bottom bar, can also program bottom bar to hide */}
    </StyledView>
  );
}
