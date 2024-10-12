import { ButtonType, VerticalStackItem } from "@/src/types/shared.types";
import React, { useState } from "react";
import { Text, View } from "react-native";
import VerticalStack from "../shared/VerticleStack";
import { StyledView } from "./canvas/Canvas";
import { useNav } from "@/src/contexts/NavigationProvider";
import { AnimatePresence } from "moti";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { useJournal } from "@/src/contexts/JournalProvider";
import { useData } from "@/src/contexts/DataProvider";

export default function JournalMenu({
  onEditClick,
  onShareClick,
}: {
  onEditClick: () => void;
  onShareClick: () => void;
}) {
  const { editMode } = useJournal();
  const { dailyEntryAvailable, hasSelectedDateEntry, pagesMap, selectedDate, toDayString } = useData();

  const getListItems = (): VerticalStackItem[] => {
    return [
      {
        onClick: () => onEditClick(),
        primary: dailyEntryAvailable && selectedDate === toDayString(new Date()),
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
        //disabled if we don't have an entry for today
        disabled: !hasSelectedDateEntry,
      },
    ];
  };
  return (
    <StyledView className="absolute right-5 bottom-10">
      <AnimatePresence>
        {/* Menu Button */}
        {!editMode && <VerticalStack items={getListItems()} key="menu-list" />}
      </AnimatePresence>
    </StyledView>
  );
}
