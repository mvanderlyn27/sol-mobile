import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const exampleData = [
  ["Page 1 - Item 1", "Page 1 - Item 2", "Page 1 - Item 3"],
  ["Page 2 - Item 1", "Page 2 - Item 2", "Page 2 - Item 3"],
  ["Page 3 - Item 1", "Page 3 - Item 2", "Page 3 - Item 3"],
];

export default function PagerTest() {
  return (
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
          style={{ width, height }}>
          {columnData.map((item, rowIndex) => (
            <View
              key={rowIndex}
              style={{
                width,
                height,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: `rgba(0,0,255,${0.1 * (rowIndex + 1)})`,
              }}>
              <Text style={{ fontSize: 24, color: "white" }}>{item}</Text>
            </View>
          ))}
        </ScrollView>
      ))}
    </ScrollView>
  );
}
