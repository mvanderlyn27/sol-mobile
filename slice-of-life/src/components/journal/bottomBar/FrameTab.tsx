import React, { useState, useContext } from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import { MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { CanvasItem, Frame } from "@/src/types/shared.types";
const StyledMotiView = styled(MotiView);

export default function FrameTab({ onSelect }: { onSelect: () => void }) {
  const { frames } = useData(); // Fetch frames from the context
  const { canvas, tempCanvas, addCanvasItem } = useCanvas();
  const itemsPerPage = 6; // Number of items you want to display per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate the number of pages based on the data
  const totalPages = Math.ceil(frames.length / itemsPerPage);

  const getPageFrames = (page: number) => {
    const startIndex = page * itemsPerPage;
    return frames.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleAddFrame = (frame: Frame) => {
    if (!tempCanvas) {
      console.log("no temp canvas");
      return;
    }
    const newFrame: CanvasItem = {
      id: tempCanvas.curId + 1,
      dbId: frame.id,
      type: "frame",
      path: frame.path,
      width: frame.width ?? 100,
      height: frame.height ?? 100,
      x: tempCanvas.screenWidth / 2,
      y: tempCanvas.screenHeight / 2,
      z: canvas.maxZIndex + 1,
      scale: 1,
      rotation: 0,
    };
    addCanvasItem(newFrame);
    onSelect();
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
              {getPageFrames(pageIndex).map((frame) => (
                <Pressable key={frame.id} onPress={() => handleAddFrame(frame)} style={{ width: "30%", margin: 5 }}>
                  <Image source={{ uri: frame.path }} style={{ width: "100%", height: 100, borderRadius: 10 }} />
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
