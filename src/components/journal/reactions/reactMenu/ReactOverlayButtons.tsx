import OverlayTextButton from "@/src/components/shared/OverlayTextButton";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { CanvasReaction, CanvasText, Reaction } from "@/src/types/shared.types";
import { addCanvasItem, canvasStore$, updateCanvasItem } from "@/src/stores/CanvasStore";
import { generateId } from "@/src/stores/AsyncStorage";
import { Dimensions } from "react-native";
import { addReactItem, reactStore$, updateReactItem } from "@/src/stores/ReactStore";
const { height, width } = Dimensions.get("screen");

const ReactOverlayButtons = observer(function ReactOverlayButtons() {
  const createReaction = () => {
    const newId = generateId();
    // const z = canvasStore$.curCanvas.maxZIndex.get() || 0;
    const reaction: CanvasReaction = {
      type: "reaction",
      id: newId,
      x: width / 2,
      y: height / 2,
      rotation: 0,
      scale: 1,
      z: 1,
      textContent: textStore$.text.get(),
      fontSize: textStore$.size.get(),
      fontColor: textStore$.color.get(),
      fontType: fonts[textStore$.fontIndex.get()],
    };
    addReactItem(reaction);
  };
  const updateReaction = (id: string) => {
    const reaction = {
      textContent: textStore$.text.get(),
      fontSize: textStore$.size.get(),
      fontColor: textStore$.color.get(),
      fontType: fonts[textStore$.fontIndex.get()],
    };
    updateReactItem(id, reaction as CanvasReaction);
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
