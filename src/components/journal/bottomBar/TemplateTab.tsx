import React, { useState } from "react";
import { View, TouchableOpacity, Pressable, Text, FlatList } from "react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
import { Template } from "@/src/types/shared.types";
import { useCanvas } from "@/src/contexts/CanvasProvider";

const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);

export default function TemplateTab({ onSelect }: { onSelect: () => void }) {
  const { templates } = useData(); // Fetch templates from the context
  const { useTemplate } = useCanvas();
  const itemsPerPage = 6; // Number of items you want to display per page
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate the number of pages based on the data
  const totalPages = Math.ceil(templates.length / itemsPerPage);

  const getPageTemplates = (page: number) => {
    const startIndex = page * itemsPerPage;
    return templates.slice(startIndex, startIndex + itemsPerPage);
  };

  const handleSelectTemplate = (template: Template) => {
    onSelect();
    console.log("select template");
    useTemplate(template.data as string);
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <Pressable
      key={item.id}
      onPress={() => handleSelectTemplate(item)}
      style={{
        // flex: 1, // Evenly divide available space
        width: "27%",
        margin: 8, // Add some spacing between items
        aspectRatio: 0.55, // Adjust aspect ratio to match the template preview
        // borderRadius: 10,
        overflow: "hidden",
      }}>
      <Image
        source={{ uri: item.path ? item.path : "" }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 10,
          resizeMode: "cover",
        }}
      />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <StyledText className="text-secondary text-xl mb-2" style={{ fontFamily: "PragmaticaExtended" }}>
        TEMPLATES
      </StyledText>

      <FlatList
        data={getPageTemplates(currentPage)} // Get templates for the current page
        renderItem={renderTemplateItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3} // Set number of columns to 3
        // contentContainerStyle={{ paddingHorizontal: 8 }} // Add horizontal padding
        // columnWrapperStyle={{ justifyContent: "space-between" }} // Evenly space out the columns
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
