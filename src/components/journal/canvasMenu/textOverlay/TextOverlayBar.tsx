import MenuButton from "@/src/components/shared/MenuButton";
import { ButtonType } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { styled } from "nativewind";
import React, { useState } from "react";
import { Text, View } from "react-native";
import SettingsTab from "./SettingTab";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import { uiStore$ } from "@/src/stores/UIStore";
import { removeCanvasItem } from "@/src/services/Page";
import tinycolor from "tinycolor2";

const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledBlurView = styled(BlurView);
export const getNiceContrastingColor = (color: string) => {
  const baseColor = tinycolor(color);

  if (baseColor.isDark()) {
    // If the color is dark, lighten it to create contrast
    return baseColor.lighten(30).toHexString();
  } else if (baseColor.isLight()) {
    // If the color is light, darken it to create contrast
    return baseColor.darken(30).toHexString();
  }

  // Fallback for colors that might be exactly black or white
  return baseColor.isValid() ? baseColor.complement().toHexString() : "#000000";
};
const TextOverlayBar = observer(function TextOverlayBar() {
  const [activeMenu, setActiveMenu] = useState<"settings" | "text" | null>("settings");

  const toggleMenu = (menu: "settings" | "text") => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };
  const toggleFont = () => {
    const index = fonts.indexOf(textStore$.font.get());
    console.log("toggling font", index);
    textStore$.font.set(fonts[(index + 1) % fonts.length]);
  };
  const close = () => {
    // journalStore$.editMode.set(false);
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayTextOverlay.set(false);
  };
  const toggleTextAlign = () => {
    const curTextAlign = textStore$.textAlign.get();
    const index = ["left", "center", "right"].indexOf(curTextAlign);
    console.log("toggling text align", index);
    textStore$.textAlign.set(["left", "center", "right"][(index + 1) % 3] as "left" | "center" | "right");
  };
  const toggleBackground = () => {
    // States: normal, inversed
    const curBackgroundState = textStore$.textBackground.get();
    const newBackgroundState =
      curBackgroundState === "normal" ? "inversed" : curBackgroundState === "inversed" ? null : "normal";
    // Update the background state
    textStore$.textBackground.set(newBackgroundState as "normal" | "inversed" | null);

    // Get current colors
    const curColor = textStore$.color.get();
    const curBackgroundColor = textStore$.textBackgroundColor.get();
    if (!curBackgroundColor) {
      // Determine and set the initial background color based on the current text color
      const newBackgroundColor = getNiceContrastingColor(curColor);
      textStore$.textBackgroundColor.set(newBackgroundColor);
      console.log(`Background color set to ${newBackgroundColor} for contrast.`);
    }
    // else if (newBackgroundState === "inversed") {
    //   // Swap text and background colors when in inversed state
    //   textStore$.color.set(curBackgroundColor);
    //   textStore$.textBackgroundColor.set(curColor);
    //   console.log("Swapped text and background colors.");
    // } else {
    //   // Reset to normal state
    //   textStore$.color.set(curColor);
    //   textStore$.textBackgroundColor.set(null);
    //   console.log("Reset to normal state, removed background color.");
    // }
  };
  const handleDelete = () => {
    const id = textStore$.id.get();
    if (id !== "") {
      removeCanvasItem(id);
    }
    textStore$.reset();
    close();
  };
  const getTextAlignButton = (align: "left" | "center" | "right") => {
    switch (align) {
      case "left":
        return ButtonType.TextLeft;
      case "center":
        return ButtonType.TextCenter;
      case "right":
        return ButtonType.TextRight;
      default:
        return ButtonType.TextLeft;
    }
  };

  return (
    <StyledView className="justify-end px-4" pointerEvents="box-none">
      {/* Sliding Menus */}
      <StyledMotiView
        className="w-full flex-row justify-center mb-4"
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: activeMenu ? 1 : 0, translateY: activeMenu ? 0 : 10 }}
        transition={{ type: "timing", duration: 300 }}
        style={{ display: activeMenu ? "flex" : "none" }}>
        <StyledView className="bg-black rounded-2xl overflow-hidden h-auto w-full">
          {activeMenu === "settings" && <SettingsTab />}
        </StyledView>
      </StyledMotiView>

      {/* Bottom Bar */}
      <StyledView className="w-full mb-4">
        <StyledView className=" h-14  rounded-full flex-row bg-black">
          {/* Trash Button */}
          <StyledView className="flex-1 justify-center items-center">
            <MenuButton onPress={handleDelete} buttonType={ButtonType.Trash} />
          </StyledView>

          {/* Settings Button */}
          <StyledView className="flex-1 justify-center items-center">
            <MenuButton onPress={() => toggleMenu("settings")} buttonType={ButtonType.Settings} />
          </StyledView>
          <StyledView className="flex-1 justify-center items-center">
            <MenuButton onPress={() => toggleTextAlign()} buttonType={getTextAlignButton(textStore$.textAlign.get())} />
          </StyledView>
          {/* Text Button */}
          <StyledView className="flex-1 justify-center items-center">
            <MenuButton onPress={toggleBackground} buttonType={ButtonType.TextBackground} />
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
});

export default TextOverlayBar;
