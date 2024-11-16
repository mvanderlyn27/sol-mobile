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
import { canvasStore$, removeCanvasItem } from "@/src/stores/CanvasStore";

const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledBlurView = styled(BlurView);

const TextOverlayBar = observer(function TextOverlayBar() {
  const [activeMenu, setActiveMenu] = useState<"settings" | "text" | null>(null);

  const toggleMenu = (menu: "settings" | "text") => {
    setActiveMenu((current) => (current === menu ? null : menu));
  };
  const toggleFont = () => {
    const index = textStore$.fontIndex.get();
    textStore$.fontIndex.set((index + 1) % fonts.length);
  };
  const close = () => {
    // journalStore$.editMode.set(false);
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayTextOverlay.set(false);
  };
  const handleDelete = () => {
    const id = textStore$.id.get();
    if (id !== "") {
      removeCanvasItem(id);
    }
    textStore$.reset();
    close();
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

          {/* Text Button */}
          <StyledView className="flex-1 justify-center items-center">
            <MenuButton onPress={toggleFont} buttonType={ButtonType.Text} />
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledView>
  );
});

export default TextOverlayBar;
