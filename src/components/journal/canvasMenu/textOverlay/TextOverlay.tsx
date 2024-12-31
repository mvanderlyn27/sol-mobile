import { observer } from "@legendapp/state/react";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { styled } from "nativewind";
import React, { useRef } from "react";
import { View, TextInput, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import TextOverlayBar from "./TextOverlayBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, textStore$ } from "@/src/stores/EditTextStore";
import TextOverlayButtons from "./TextOverlayButtons";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const StyledPressable = styled(Pressable);
const StyledBlurView = styled(BlurView);
const StyledTextInput = styled(TextInput);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const TextOverlay = observer(function TextOverlay() {
  const textSize = textStore$.size.get();
  const textColor = textStore$.color.get();
  const font = textStore$.font.get();
  const text = textStore$.text.get();
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
          <TextOverlayButtons />
          <StyledPressable
            onPress={handleParentPress}
            className="flex-1  justify-center"
            style={{ paddingHorizontal: 10 }}>
            <StyledTextInput
              ref={textInputRef}
              style={{
                color: textColor,
                fontSize: textSize,
                fontFamily: font || "Calibri",
                textAlign: textAlign || "left",
              }}
              value={text}
              // placeholder={text}
              onChangeText={(newText) => textStore$.text.set(newText)}
              autoFocus // Only autofocus if text is empty
              multiline
            />
          </StyledPressable>
          <TextOverlayBar />
        </StyledKeyboardAvoidingView>
      </SafeAreaView>
    </StyledBlurView>
  );
});

export default TextOverlay;
