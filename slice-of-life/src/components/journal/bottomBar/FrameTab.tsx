import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, Pressable, Dimensions } from "react-native";
import { Image } from "expo-image";
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
  const getScale = (frameWidth: number, frameHeight: number, screenWidth: number, screenHeight: number): number => {
    // Calculate 70% of screen dimensions
    const targetWidth = screenWidth * 0.7;
    const targetHeight = screenHeight * 0.7;

    // Calculate the scaling factors for both width and height
    const scaleWidth = targetWidth / frameWidth;
    const scaleHeight = targetHeight / frameHeight;

    // The maximum scale is the smaller of the two scaling factors
    return Math.min(scaleWidth, scaleHeight);
  };

  const handleAddFrame = (frame: Frame) => {
    if (!tempCanvas) {
      console.log("no temp canvas");
      return;
    }
    const scale = getScale(frame.width, frame.height, tempCanvas.screenWidth, tempCanvas.screenHeight);
    const scaledWidth = scale * frame.width;
    const scaledHeight = scale * frame.height;

    // Calculate the centered x and y positions
    const x = (tempCanvas.screenWidth - scaledWidth) / 2;
    const y = (tempCanvas.screenHeight - scaledHeight) / 2;
    const newFrame: CanvasItem = {
      id: tempCanvas.curId + 1,
      dbId: frame.id,
      type: "frame",
      path: frame.path,
      width: frame.width,
      height: frame.height,
      y: y,
      x: x,
      z: tempCanvas.maxZIndex + 1,
      scale: getScale(frame.width, frame.height, tempCanvas.screenWidth, tempCanvas.screenHeight),
      rotation: 0,
      slots: [
        {
          maskPath: frame.maskPath ?? "",
        },
      ],
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
          <View key={pageIndex} style={{ padding: 0 }}>
            <StyledMotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500 }}
              className="flex flex-wrap flex-row justify-start items-start">
              {/* Wrap frames in a View with flex properties for the grid layout */}
              {getPageFrames(pageIndex).map((frame) => (
                <Pressable
                  key={frame.id}
                  onPress={() => handleAddFrame(frame)}
                  style={{
                    width: "30%", // Make each item 30% width (3 columns)
                    margin: 5,
                    aspectRatio: 1, // Maintain a square aspect ratio
                  }}>
                  <Image
                    source={frame.path}
                    style={{
                      width: "100%",
                      height: "100%", // Fill the entire space
                      borderRadius: 10,
                      resizeMode: "contain", // Ensure the image covers the entire container
                    }}
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
