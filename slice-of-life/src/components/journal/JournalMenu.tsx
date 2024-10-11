import { ButtonType, VerticalStackItem } from "@/src/types/shared.types";
import React, { useState } from "react";
import { Text, View } from "react-native";
import VerticalStack from "../shared/VerticleStack";
import { StyledView } from "./canvas/Canvas";
import { useNav } from "@/src/contexts/NavigationProvider";
import { AnimatePresence } from "moti";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { useJournal } from "@/src/contexts/JournalProvider";

export default function JournalMenu({
  onEditClick,
  onShareClick,
}: {
  onEditClick: () => void;
  onShareClick: () => void;
}) {
  const { editMode } = useJournal();
  const getListItems = (): VerticalStackItem[] => {
    return [
      {
        onClick: () => onEditClick(),
        primary: true,
        buttonType: ButtonType.JournalEdit,
        disabled: false,
        selected: true,
      },
      {
        onClick: () => onShareClick(),
        primary: false,
        //based on if we've filled out today or not
        //check data provider for currentPage
        selected: true,
        buttonType: ButtonType.Share,
        disabled: true,
      },
    ];
  };
  return (
    <StyledView className="absolute right-10 bottom-10">
      <AnimatePresence>
        {/* Menu Button */}
        {!editMode && <VerticalStack items={getListItems()} key="menu-list" />}
      </AnimatePresence>
    </StyledView>
  );
}
