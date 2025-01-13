import { observer } from "@legendapp/state/react";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { styled } from "nativewind";
import React, { useEffect, useRef } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import tinycolor from "tinycolor2";
import { set } from "lodash";
import ReactOverlayBar from "./ReactOverlayBar";
import { getNiceContrastingColor } from "../../canvasMenu/textOverlay/TextOverlayBar";
import TextOverlayButtons from "../../canvasMenu/textOverlay/TextOverlayButtons";
import ReactOverlayButtons from "./ReactOverlayButtons";
import { appState$ } from "@/src/services/AppStore";

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View);
const StyledBlurView = styled(BlurView);
const StyledTextInput = styled(TextInput);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const ReactOverlay = observer(function TextOverlay() {
  const textSize = textStore$.size.get();
  const textColor = textStore$.color.get();
  const font = textStore$.font.get();
  const text = textStore$.text.get();
  const textBackground = textStore$.textBackground.get();
  // const [textBackgroundColor, setTextBackgroundColor] = React.useState<string>("transparent");
  const textBackgroundColor = textStore$.textBackgroundColor.get();
  const updateBackgroundColor = () => {
    //need to go to normal mode if we setting the color
    if (textBackground === "normal") {
      textStore$.textBackgroundColor.set(getNiceContrastingColor(textColor));
      return;
    }
    if (textBackground === "inversed") {
      textStore$.textBackgroundColor.set(getNiceContrastingColor(textColor));
      return;
    }
    textStore$.textBackgroundColor.set("transparent");
  };
  // updateBackgroundColor();
  useEffect(() => {
    updateBackgroundColor();
  }, [textBackground, textColor]);
  const textAlign = textStore$.textAlign.get();
  // Ref for the TextInput
  const textInputRef = useRef<TextInput>(null);

  const handleParentPress = () => {
    // Focus the TextInput when parent is pressed
    textInputRef.current?.focus();
  };
  return (
    <StyledBlurView tint="dark" className="absolute top-0 right-0 left-0 bottom-0" pointerEvents="box-none">
      <SafeAreaView style={{ flex: 1 }}>
        <StyledKeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ReactOverlayButtons />
          <StyledPressable
            onPress={handleParentPress}
            className="flex-1 justify-center items-center relative"
            style={{ paddingHorizontal: 10 }}>
            {/* Transparent TextInput */}
            <StyledTextInput
              className="absolute p-2 m-0"
              style={{
                width: "100%", // Ensure it spans the full width
                backgroundColor:
                  textBackground === null
                    ? "transparent"
                    : textBackground === "normal"
                    ? textBackgroundColor
                      ? textBackgroundColor
                      : "transparent"
                    : textColor,
              }}
              // value={text}
              onChangeText={(newText) => textStore$.text.set(newText)}
              multiline
              autoFocus
              ref={textInputRef}>
              <Text
                style={{
                  fontSize: textSize * appState$.adjustedHeight.get(),
                  color:
                    textBackground === "inversed"
                      ? textBackgroundColor
                        ? textBackgroundColor
                        : "transparent"
                      : textColor,
                  fontFamily: font || "Calibri",
                  textAlign: textAlign || "left",
                  // lineHeight: textSize * 1.1, // Match line height
                  lineHeight: textSize * appState$.adjustedHeight.get() * 1.1, // Match line height
                }}>
                {text}
              </Text>
            </StyledTextInput>
          </StyledPressable>
          <ReactOverlayBar />
        </StyledKeyboardAvoidingView>
      </SafeAreaView>
    </StyledBlurView>
  );
});

export default ReactOverlay;
