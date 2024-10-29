import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import PagerView from "react-native-pager-view";
import { format, addDays, parseISO } from "date-fns";
import { useJournalStore } from "@/src/stores/JournalStore";
import { styled } from "nativewind";

const StyledView = styled(View);

export default function JournalView() {
  const { leftPage, currentPage, rightPage, selectedDate, initializeStore, setSelectedDate } = useJournalStore();
  const ref = useRef<PagerView>(null);
  const [canScroll, setCanScroll] = useState(true);

  // Initial load for today's page and its neighbors
  useEffect(() => {
    initializeStore();
  }, []);

  const handlePageSelected = async (e: any) => {
    if (!selectedDate) return;
    const newPosition = e.nativeEvent.position;
    if (newPosition === 1) return;
    setCanScroll(false);
    const direction = newPosition === 0 ? -1 : 1;

    // Convert selectedDate back to Date object for addDays
    const parsedDate = parseISO(selectedDate);
    const newDate = addDays(parsedDate, direction);
    console.log("new date", newDate);
    await setSelectedDate(newDate);

    // Ensure ref exists before calling method
    ref.current?.setPageWithoutAnimation(1);
    setCanScroll(true);
  };

  // Render nothing until both required pages are loaded
  if (!leftPage || !currentPage) {
    return (
      <StyledView className="flex-1" style={{ backgroundColor: "blue" }}>
        <Text>Loading...</Text>
      </StyledView>
    );
  }

  return (
    <PagerView
      ref={ref}
      style={{ flex: 1 }}
      layoutDirection="ltr"
      scrollEnabled={canScroll}
      initialPage={1}
      onPageSelected={handlePageSelected}
      overdrag
      offscreenPageLimit={5}>
      {rightPage
        ? [leftPage, currentPage, rightPage].map((page, index) => (
            <StyledView key={page.date + "-" + index} className="flex-1" style={{ backgroundColor: "white" }}>
              <Text>{format(parseISO(page.date), "MMM d, yyyy")}</Text>
            </StyledView>
          ))
        : [leftPage, currentPage].map((page, index) => (
            <StyledView key={page.date + "-" + index} className="flex-1" style={{ backgroundColor: "white" }}>
              <Text>{format(parseISO(page.date), "MMM d, yyyy")}</Text>
            </StyledView>
          ))}
    </PagerView>
  );
}
