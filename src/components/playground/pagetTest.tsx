import React, { useMemo, useState, useCallback, useEffect } from "react";
import { FlatList, View, Dimensions, ActivityIndicator } from "react-native";
import { observer } from "@legendapp/state/react";
import Canvas from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { getUsersPagesForDate, journalStore$, pages$ } from "@/src/stores/PagesStore";
import { filterGroupMembers, groupMembers$ } from "@/src/stores/MemberStore";
import { jsonToCanvas } from "@/src/services/Canvas";
import { GroupMember, ImageType, Page } from "@/src/types/shared.types";
import { addDays, format } from "date-fns";
import debounce from "lodash/debounce";
import authStore$ from "@/src/stores/AuthStore";

const { width, height } = Dimensions.get("window");

const defaultCanvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [],
  screenWidth: width,
  screenHeight: height,
  curId: 0,
  maxZIndex: 0,
};

const INITIAL_LOAD_DAYS = 5;

const PagerTest = observer(({ groupId }) => {
  const [pageData, setPageData] = useState<Record<string, Page[]>>({});
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const user = authStore$.session.get()?.user;
  const members = useMemo(() => {
    const filteredMembers = Object.values(filterGroupMembers(groupMembers$.get(), groupId) || {});
    return filteredMembers.sort((a, b) => (a.user_id === user?.id ? -1 : b.user_id === user?.id ? 1 : 0));
  }, [groupId]);
  // Function to load additional days when necessary
  const loadPagesForUser = async (userIndex: number, daysToLoad: number) => {
    const member = members[userIndex];
    if (member) {
      const fetchedPages = getUsersPagesForDate(member.user_id, daysToLoad, pages$.get());

      setPageData((prevData) => ({
        ...prevData,
        [member.user_id]: fetchedPages,
      }));
    }
  };

  // Initial data load
  useEffect(() => {
    members.forEach((_, index) => loadPagesForUser(index, INITIAL_LOAD_DAYS));
  }, [members]);

  const onUserViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      const newIndex = viewableItems[0]?.index || 0;
      setCurrentUserIndex(newIndex);
      journalStore$.currentUser.set(members[newIndex].user_id);

      // Trigger data load if not already loaded for new user
      if (!pageData[members[newIndex].user_id]?.length) {
        loadPagesForUser(newIndex, INITIAL_LOAD_DAYS);
      }
    },
    [members, pageData]
  );

  const onPageViewableItemsChanged = useCallback(
    debounce(({ viewableItems }: any) => {
      const userPages = pageData[members[currentUserIndex]?.user_id] || [];
      const lastIndex = viewableItems[0]?.index;
      journalStore$.currentDate.set(userPages[lastIndex]?.date);

      if (lastIndex < 2) {
        loadPagesForUser(currentUserIndex, userPages.length + INITIAL_LOAD_DAYS);
      }
    }, 200), // Adjust debounce time based on UX
    [currentUserIndex, pageData, members]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={members}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onUserViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(member) => member.user_id}
        renderItem={({ item: member }) => (
          <FlatList
            data={pageData[member.user_id] || []}
            horizontal
            pagingEnabled
            inverted
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onPageViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            keyExtractor={(page, index) => `page_${index}`}
            renderItem={({ item: page }) => {
              return (
                <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
                  <Canvas canvas={jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas} />
                </View>
              );
            }}
          />
        )}
      />
      <JournalOverlays />
    </View>
  );
});

export default PagerTest;
