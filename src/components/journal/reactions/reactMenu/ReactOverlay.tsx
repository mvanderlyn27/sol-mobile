import { observer } from "@legendapp/state/react";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { styled } from "nativewind";
import React from "react";
import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import TextOverlayButtons from "./ReactOverlayButtons";
import ReactOverlayBar from "./ReactOverlayBar";

const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const StyledBlurView = styled(BlurView);
const StyledTextInput = styled(TextInput);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

const ReactOverlay = observer(function ReactOverlay() {
  const textSize = textStore$.size.get();
  const textColor = textStore$.color.get();
  const font = textStore$.font.get();
  const text = textStore$.text.get();

  return (
    <StyledBlurView tint="dark" className="absolute top-0 right-0 left-0 bottom-0" pointerEvents="box-none">
      <SafeAreaView style={{ flex: 1 }}>
        <StyledKeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TextOverlayButtons />
          <StyledView className="flex-1 items-center justify-center px-8">
            <StyledTextInput
              style={{
                color: textColor,
                fontSize: textSize,
                fontFamily: font || "Calibri",
                textAlign: "center",
              }}
              value={text}
              onChangeText={(newText) => textStore$.text.set(newText)}
              autoFocus // Only autofocus if text is empty
              multiline
            />
          </StyledView>
          <ReactOverlayBar />
        </StyledKeyboardAvoidingView>
      </SafeAreaView>
    </StyledBlurView>
  );
});

export default ReactOverlay;
