import React, { useState, useContext } from "react";
import { View, TouchableOpacity, Pressable } from "react-native";
import { Image } from "expo-image";

import PagerView from "react-native-pager-view";
import { MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
const StyledMotiView = styled(MotiView);

export default function TemplateTab({ onSelect }: { onSelect: () => void }) {
  const { templates } = useData(); // Fetch frames from the context
  const itemsPerPage = 6; // Number of items you want to display per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate the number of pages based on the data
  const totalPages = Math.ceil(templates.length / itemsPerPage);

  const getPageFrames = (page: number) => {
    const startIndex = page * itemsPerPage;
    return templates.slice(startIndex, startIndex + itemsPerPage);
  };
  const handleSelectTemplate = () => {
    onSelect();
    console.log("select template");
  };
  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e: any) => setCurrentPage(e.nativeEvent.position)}>
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <View key={pageIndex} style={{ padding: 10 }}>
            <StyledMotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
              className="flex flex-wrap flex-row justify-start items-start">
              {getPageFrames(pageIndex).map((template) => (
                // update to have canvas added here
                <Pressable key={template.id} onPress={handleSelectTemplate} style={{ width: "30%", margin: 5 }}>
                  <Image
                    source={{ uri: template.path ? template.path : "" }}
                    style={{ width: "100%", height: 100, borderRadius: 10 }}
                  />
                </Pressable>
              ))}
            </StyledMotiView>
          </View>
        ))}
      </PagerView>

      {/* Pagination Indicators */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 10 }}>
        {Array.from({ length: totalPages }).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentPage(index)}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: currentPage === index ? "#f39c12" : "#dcdcdc",
              marginHorizontal: 5,
            }}
          />
        ))}
      </View>
    </View>
  );
}
