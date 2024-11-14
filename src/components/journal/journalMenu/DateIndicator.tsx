import { View, Pressable, Dimensions } from "react-native";
import { AnimatePresence, MotiView, Text } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { BottomBarTab, BottomDrawerType, ButtonType } from "@/src/types/shared.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
//<MaterialIcons name="text-fields" size={24} color="black" />
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// <MaterialCommunityIcons name="content-save-outline" size={24} color="black" />
import Feather from "@expo/vector-icons/Feather";
//<Feather name="image" size={24} color="black" />
//<Feather name="layout" size={24} color="black" />
import AntDesign from "@expo/vector-icons/AntDesign";
import TemplateTab from "./TemplateTab";
import { useJournal } from "@/src/contexts/JournalProvider";
import { useCanvas } from "@/src/contexts/CanvasProvider";
import { BlurView } from "expo-blur";
import Foundation from "@expo/vector-icons/Foundation";
import BackgroundTab from "./BackgroundTab";
import { observer } from "@legendapp/state/react";
import { uiStore$ } from "@/src/stores/UIStore";
import { pageStore$ } from "@/src/stores/PagesStore";
import { batch, beginBatch, endBatch } from "@legendapp/state";
import MenuButton from "../../shared/MenuButton";
import RoundButton from "../../shared/CircleButton";
//<AntDesign name="closecircleo" size={24} color="black" />
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledFoundation = styled(Foundation);
const { width, height } = Dimensions.get("window");
const StyledBlurView = styled(BlurView);
const DateIndicator = observer(function DateIndicator() {
  const dates = pageStore$.dates.get();
  const col = pageStore$.curCol.get();
  const date = dates[col];
  return (
    <StyledMotiView
      key="bottom-bar"
      className=" flex-1 justify-center items-center z-10"
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 20 }}
      exitTransition={{ type: "timing", duration: 100 }}
      transition={{ type: "timing", duration: 100 }}>
      <StyledBlurView tint="dark" className="p-3 rounded-xl bg-black/80 overflow-hidden">
        <StyledMotiView key="bottom-bar" className="justify-between items-center rounded-full ">
          <AnimatePresence exitBeforeEnter={true}>
            <MotiView
              key={date.date} // Reset animation on each text change
              from={{
                opacity: 0,
                translateX: -50, // Start slightly above the frame
                rotateY: "90deg", // Initial rotation to make it appear from top
              }}
              animate={{
                opacity: 1,
                translateX: 0,
                rotateY: "0deg", // Rotate to bring text into view
              }}
              exit={{
                opacity: 0,
                translateX: 50, // Move out to bottom of frame
                rotateY: "-90deg", // Rotate out to complete 3D effect
              }}
              transition={{
                type: "timing",
                duration: 200,
              }}>
              <Text style={{ fontSize: 18, color: "white" }}>{date.date}</Text>
            </MotiView>
          </AnimatePresence>
        </StyledMotiView>
      </StyledBlurView>
    </StyledMotiView>
  );
});
export default DateIndicator;
