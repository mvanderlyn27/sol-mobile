import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { CanvasItem, Frame } from "@/src/types/shared.types";

const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);

export default function FrameTab({ onSelect }: { onSelect: () => void }) {
  const { frames } = useData(); // Fetch frames from the context
  const { tempCanvas, addCanvasItem } = useCanvas();
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 6; // Number of items you want to display per page

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
      width: frame.width,
      height: frame.height,
      y: (tempCanvas.screenHeight - frame.height) / 2, // Centered
      x: (tempCanvas.screenWidth - frame.width) / 2, // Centered
      z: tempCanvas.maxZIndex + 1,
      scale: 1,
      rotation: 0,
      slots: [{ maskPath: frame.maskPath ?? "" }],
    };
    addCanvasItem(newFrame);
    onSelect();
  };

  const renderFrameItem = ({ item }: { item: Frame }) => (
    <TouchableOpacity
      onPress={() => handleAddFrame(item)}
      style={{
        flex: 1, // Evenly divide available space
        margin: 8, // Add some spacing between items
        aspectRatio: 1, // Keep the items square
        // borderRadius: 10,
        overflow: "hidden",
      }}>
      <Image
        source={item.path}
        style={{
          width: "100%",
          height: "100%",
          // borderRadius: 10,
          resizeMode: "contain",
        }}
      />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <StyledText className="text-secondary text-xl mb-2" style={{ fontFamily: "PragmaticaExtended" }}>
        FRAMES
      </StyledText>
      <FlatList
        data={getPageFrames(currentPage)} // Get frames for the current page
        renderItem={renderFrameItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3} // Set number of columns to 3
        showsVerticalScrollIndicator={false} // Hide vertical scroll indicator
      />

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
