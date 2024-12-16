import OverlayTextButton from "@/src/components/shared/OverlayTextButton";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
import { MotiView } from "moti";
import { styled } from "nativewind";
import { CanvasText } from "@/src/types/shared.types";
import { generateId } from "@/src/stores/AsyncStorage";
import { Dimensions } from "react-native";
import { addCanvasItem, updateCanvasItem } from "@/src/services/Page";
const { height, width } = Dimensions.get("screen");

const TextOverlayButtons = observer(function TextOverlayButtons() {
  const createText = () => {
    const newId = generateId();
    const textItem: CanvasText = {
      id: newId,
      type: "text",
      x: width / 2,
      y: height / 2,
      rotation: 0,
      z: 0,
      textContent: textStore$.text.get(),
      fontSize: textStore$.size.get(),
      fontColor: textStore$.color.get(),
      fontType: textStore$.font.get(),
      width: 0,
      height: 0,
    };
    addCanvasItem(textItem);
  };
  const updateText = (id: string) => {
    const textItem = {
      id: id,
      type: "text",
      textContent: textStore$.text.get(),
      fontSize: textStore$.size.get(),
      fontColor: textStore$.color.get(),
      fontType: textStore$.font.get(),
    } as CanvasText;
    console.log("updated textItem", textItem);
    updateCanvasItem(textItem);
  };
  const handleSave = () => {
    const id = textStore$.id.get();
    console.log("id", id);
    if (id !== "") {
      console.log("updating");
      updateText(id);
    } else {
      console.log("creating");
      createText();
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
    uiStore$.displayCanvasMenu.set(true);
    uiStore$.displayTextOverlay.set(false);
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
export default TextOverlayButtons;
