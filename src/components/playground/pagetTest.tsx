import React, { useMemo, useState, useEffect, useCallback } from "react";
import { FlatList, View, Dimensions, ActivityIndicator } from "react-native";
import { observer } from "@legendapp/state/react";
import Canvas from "../journal/canvas/Canvas";
import JournalOverlays from "../journal/JournalOverlays";
import { getUsersPagesForDate, journalStore$, pages$ } from "@/src/stores/PagesStore";
import { filterGroupMembers, groupMembers$ } from "@/src/stores/MemberStore";
import { jsonToCanvas } from "@/src/services/Canvas";
import { GroupMember, ImageType, Page } from "@/src/types/shared.types";
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
  }, [groupId, user?.id]);

  // Load pages for the user if not already loaded
  const loadPagesForUser = useCallback(async (userId: string, daysToLoad: number) => {
    const fetchedPages = getUsersPagesForDate(userId, daysToLoad, pages$.get());
    setPageData((prevData) => ({ ...prevData, [userId]: fetchedPages }));
  }, []);

  // Load initial data
  useEffect(() => {
    members.forEach((member) => loadPagesForUser(member.user_id, INITIAL_LOAD_DAYS));
  }, [members, loadPagesForUser]);

  // Triggered when user changes (vertical scroll)
  const handleUserChange = useCallback(
    ({ viewableItems }: any) => {
      const newIndex = viewableItems[0]?.index || 0;
      setCurrentUserIndex(newIndex);
      const userId = members[newIndex]?.user_id;
      journalStore$.currentUser.set(userId);

      if (!pageData[userId]?.length) {
        loadPagesForUser(userId, INITIAL_LOAD_DAYS);
      }
    },
    [members, pageData, loadPagesForUser]
  );

  // Load additional pages when scrolling horizontally
  const handlePageChange = useCallback(
    ({ viewableItems }: any) => {
      const userPages = pageData[members[currentUserIndex]?.user_id] || [];
      const lastIndex = viewableItems[0]?.index;
      journalStore$.currentDate.set(userPages[lastIndex]?.date);

      // Load more days if near the start
      if (lastIndex < 2) {
        loadPagesForUser(members[currentUserIndex].user_id, userPages.length + INITIAL_LOAD_DAYS);
      }
    },
    [currentUserIndex, pageData, members, loadPagesForUser]
  );

  // Canvas item for each page
  const renderCanvas = ({ item: page }: { item: Page }) => (
    <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
      <Canvas canvas={jsonToCanvas(JSON.stringify(page.canvas)) || defaultCanvas} />
    </View>
  );

  // Pages FlatList for each member
  const renderPagesForMember = ({ item: member }: { item: GroupMember }) => (
    <FlatList
      data={pageData[member.user_id] || []}
      horizontal
      pagingEnabled
      inverted
      onViewableItemsChanged={handlePageChange}
      viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      keyExtractor={(page, index) => `page_${index}`}
      renderItem={renderCanvas}
      showsHorizontalScrollIndicator={false}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={members}
        pagingEnabled
        onViewableItemsChanged={handleUserChange}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        keyExtractor={(member) => member.user_id}
        renderItem={renderPagesForMember}
        showsVerticalScrollIndicator={false}
      />
      <JournalOverlays />
    </View>
  );
});

export default PagerTest;
