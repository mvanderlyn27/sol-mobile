import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";

import PagerView from "react-native-pager-view";
import { MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { CanvasItem, Font } from "@/src/types/shared.types";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);

export default function FontTab({ onSelect }: { onSelect: () => void }) {
  const { fonts } = useData(); // Fetch frames from the context
  const { canvas, tempCanvas, addCanvasItem } = useCanvas();
  const itemsPerPage = 18; // Number of items you want to display per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate the number of pages based on the data
  const totalPages = Math.ceil(fonts.length / itemsPerPage);

  const getPageFrames = (page: number) => {
    const startIndex = page * itemsPerPage;
    return fonts.slice(startIndex, startIndex + itemsPerPage);
  };
  const handleAddText = (font: Font) => {
    if (!tempCanvas) {
      console.log("no temp canvas");
      return;
    }
    const newText: CanvasItem = {
      id: tempCanvas.curId + 1,
      dbId: font.id,
      type: "text",
      textContent: "Text",
      fontSize: 40,
      fontColor: "darkPrimary",
      fontType: font.type,
      x: canvas.screenWidth / 2,
      y: canvas.screenHeight / 2,
      z: canvas.maxZIndex + 1,
      scale: 1,
      rotation: 0,
    };
    addCanvasItem(newText);
    onSelect();
  };
  return (
    <View style={{ flex: 1 }}>
      <StyledText className="text-secondary text-xl" style={{ fontFamily: "PragmaticaExtended" }}>
        FONTS
      </StyledText>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e: any) => setCurrentPage(e.nativeEvent.position)}>
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <View key={pageIndex} style={{ padding: 0 }}>
            <StyledMotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
              className="flex flex-wrap flex-row justify-start items-start">
              {getPageFrames(pageIndex).map((font) => {
                console.log(font);
                return (
                  <Pressable key={font.id} onPress={() => handleAddText(font)} style={{ width: "30%", margin: 5 }}>
                    <Text
                      style={{ color: "#fff", fontSize: 30, fontFamily: font.type, padding: 20, textAlign: "center" }}>
                      Aa
                    </Text>
                  </Pressable>
                );
              })}
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
