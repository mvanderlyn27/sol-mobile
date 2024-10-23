import React, { useState } from "react";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import PagerView from "react-native-pager-view";
import { MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { CanvasItem, Font } from "@/src/types/shared.types";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledMotiView = styled(MotiView);

export default function FontTab({ onSelect }: { onSelect: () => void }) {
  const { fonts } = useData(); // Fetch fonts from the context
  const { canvas, tempCanvas, addCanvasItem } = useCanvas();
  const itemsPerPage = 9; // Number of items to display per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate the number of pages based on the data
  const totalPages = Math.ceil(fonts.length / itemsPerPage);

  const getPageFonts = (page: number) => {
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
      z: tempCanvas.maxZIndex + 1,
      scale: 1,
      rotation: 0,
    };
    addCanvasItem(newText);
    onSelect();
  };

  return (
    <StyledView className="flex-1">
      <StyledText className="text-secondary text-xl mb-2" style={{ fontFamily: "PragmaticaExtended" }}>
        FONTS
      </StyledText>

      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e: any) => setCurrentPage(e.nativeEvent.position)}>
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <StyledView key={pageIndex} className="p-0">
            <StyledMotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
              className="flex flex-wrap justify-start items-start">
              {getPageFonts(pageIndex).map((font) => (
                <StyledPressable
                  key={font.id}
                  onPress={() => handleAddText(font)}
                  className="w-[30%] m-1.5 items-center">
                  <StyledText className="text-white text-3xl text-center p-5" style={{ fontFamily: font.type }}>
                    Aa
                  </StyledText>
                </StyledPressable>
              ))}
            </StyledMotiView>
          </StyledView>
        ))}
      </PagerView>

      {/* Pagination Indicators */}
      <StyledView className="flex-row justify-center my-2">
        {Array.from({ length: totalPages }).map((_, index) => (
          <StyledPressable
            key={index}
            onPress={() => setCurrentPage(index)}
            className={`w-2.5 h-2.5 rounded-full mx-1 ${currentPage === index ? "bg-[#f39c12]" : "bg-[#dcdcdc]"}`}
          />
        ))}
      </StyledView>
    </StyledView>
  );
}
