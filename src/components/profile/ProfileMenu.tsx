import { ButtonType, VerticalStackItem } from "@/src/types/shared.types";
import React, { useState } from "react";
import { Text, View } from "react-native";
import VerticalStack from "../shared/VerticleStack";
import { AnimatePresence, MotiView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { styled } from "nativewind";
import { router } from "expo-router";
import { useNav } from "@/src/contexts/NavigationProvider";
import { useProfile } from "@/src/contexts/ProfileProvider";

const StyledMotiView = styled(MotiView);
export default function ProfileMenu() {
  const { dailyEntryAvailable, hasSelectedDateEntry, pagesMap, selectedDate, toDayString } = useData();
  const { navMenuVisible, setNavMenuVisible } = useNav();
  const { profileMenuVisible } = useProfile();
  const handleSettingsClick = () => {
    setNavMenuVisible(false);
    router.push("/settings");
  };
  const getListItems = (): VerticalStackItem[] => {
    return [
      {
        onClick: () => handleSettingsClick(),
        buttonType: ButtonType.Settings,
      },
    ];
  };
  return (
    <AnimatePresence>
      {profileMenuVisible && (
        <StyledMotiView
          className="absolute right-5 bottom-10"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 400 }}>
          {/* Menu Button */}
          <VerticalStack items={getListItems()} key="menu-list" />
        </StyledMotiView>
      )}
    </AnimatePresence>
  );
}
