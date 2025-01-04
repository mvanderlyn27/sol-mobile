import OverlayTextButton from "@/src/components/shared/OverlayTextButton";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { CanvasText, CanvasTextReaction } from "@/src/types/shared.types";
import { generateId } from "@/src/stores/AsyncStorage";
import { Dimensions } from "react-native";
import { addReactionItem, updateReactionItem } from "@/src/services/Reaction";
const { height, width } = Dimensions.get("screen");

const ReactOverlayButtons = observer(function ReactOverlayButtons() {
  const createReaction = () => {
    const newId = generateId();
    const reaction: CanvasTextReaction = {
      id: newId,
      type: "text",
      x: width / 2,
      y: height / 2,
      rotation: 0,
      width: 0,
      height: 0,
      z: 1,
      textContent: textStore$.text.get(),
      fontSize: textStore$.size.get(),
      fontColor: textStore$.color.get(),
      fontType: textStore$.font.get(),
      fontAlign: textStore$.textAlign.get(),
      fontBackground: textStore$.textBackground.get(),
      fontBackgroundColor: textStore$.textBackgroundColor.get(),
    };
    addReactionItem(reaction);
  };
  const updateReaction = (id: string) => {
    const reaction = {
      id: id,
      type: "text",
      textContent: textStore$.text.get(),
      fontSize: textStore$.size.get(),
      fontColor: textStore$.color.get(),
      fontType: textStore$.font.get(),
      fontAlign: textStore$.textAlign.get(),
      fontBackground: textStore$.textBackground.get(),
      fontBackgroundColor: textStore$.textBackgroundColor.get(),
    };
    updateReactionItem(reaction as CanvasTextReaction);
  };
  const handleSave = () => {
    const id = textStore$.id.get();
    console.log("id", id);
    if (id !== "") {
      console.log("updating");
      updateReaction(id);
    } else {
      console.log("creating");
      createReaction();
    }
    textStore$.reset();
    close();
  };
  const handleCancel = () => {
    textStore$.reset();
    close();
  };
  const close = () => {
    // journalStore$.editMode.set(false);
    uiStore$.displayReactMenu.set(true);
    uiStore$.displayReactOverlay.set(false);
  };
  const StyledMotiView = styled(MotiView);
  return (
    <StyledMotiView
      className="flex flex-row justify-between px-8"
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      exitTransition={{ type: "timing", duration: 100 }}
      transition={{ type: "timing", duration: 100 }}>
      <OverlayTextButton onPress={handleCancel} text="Cancel" />
      <OverlayTextButton onPress={handleSave} text="Done" bold />
    </StyledMotiView>
  );
});
export default ReactOverlayButtons;
