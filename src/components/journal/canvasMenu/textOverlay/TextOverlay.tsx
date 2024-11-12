import { observer } from "@legendapp/state/react";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { styled } from "nativewind";
import React from "react";
import { View, TextInput } from "react-native";
import TextOverlayBar from "./TextOverlayBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import TextOverlayButtons from "./TextOverlayButtons";

const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledBlurView = styled(BlurView);
const StyledTextInput = styled(TextInput);

const TextOverlay = observer(function TextOverlay() {
  const textSize = textStore$.size.get();
  const textColor = textStore$.color.get();
  const fontIndex = textStore$.fontIndex.get();
  const text = textStore$.text.get();

  return (
    <StyledBlurView tint="dark" className="absolute top-0 right-0 left-0 bottom-0" pointerEvents="box-none">
      <SafeAreaView style={{ flex: 1 }}>
        <TextOverlayButtons />
        <StyledView className="flex-1 items-center justify-center px-8">
          <StyledTextInput
            style={{
              color: textColor,
              fontSize: textSize,
              fontFamily: fontIndex ? fonts[fontIndex] : "Calibri",
              textAlign: "center",
            }}
            value={text}
            onChangeText={(newText) => textStore$.text.set(newText)}
            autoFocus
            multiline
          />
        </StyledView>
        <TextOverlayBar />
      </SafeAreaView>
    </StyledBlurView>
  );
});

export default TextOverlay;
