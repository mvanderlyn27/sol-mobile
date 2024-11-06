import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { View, Text, ScrollView, Dimensions, Pressable } from "react-native";
import Canvas from "../journal/canvas/Canvas";
import { ImageType } from "@/src/types/shared.types";
import JournalOverlays from "../journal/JournalOverlays";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const { width, height } = Dimensions.get("window");

const exampleData = [
  ["Page 1 - Item 1", "Page 1 - Item 2", "Page 1 - Item 3"],
  ["Page 2 - Item 1", "Page 2 - Item 2", "Page 2 - Item 3"],
  ["Page 3 - Item 1", "Page 3 - Item 2", "Page 3 - Item 3"],
];
const defaultCanvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [],
  screenWidth: width,
  screenHeight: height,
  curId: 0,
  maxZIndex: 0,
};
export default function PagerTest() {
  return (
    <StyledView className="flex-1">
      <StyledView className="absolute left-0 top-10 z-10">
        <StyledPressable
          onPress={() => {
            console.log("back");
            router.back();
          }}
          className="p-4 ">
          <AntDesign name="left" size={30} color="black" />
        </StyledPressable>
      </StyledView>
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}>
        {exampleData.map((columnData, columnIndex) => (
          <ScrollView
            key={columnIndex}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            style={{ width, height, transform: [{ rotateY: "180deg" }] }}>
            {columnData.map((item, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  width,
                  height,
                  justifyContent: "center",
                  alignItems: "center",
                  transform: [{ rotateY: "180deg" }],
                }}>
                <Canvas canvas={defaultCanvas} />
              </View>
            ))}
          </ScrollView>
        ))}
      </ScrollView>

      {/* <JournalOverlays /> */}
    </StyledView>
  );
}
