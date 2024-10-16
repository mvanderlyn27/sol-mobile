import { MotiView } from "moti";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styled } from "nativewind";
import { Pressable, Text } from "react-native";
import { useNav } from "@/src/contexts/NavigationProvider";
import { router } from "expo-router";
import { useMemo } from "react";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

export default function SettingsTopBar() {
  const { setNavMenuVisible } = useNav();
  const handleBack = () => {
    setNavMenuVisible(true);
    router.back();
  };
  return (
    <StyledMotiView className="p-4 justify-center items-center">
      <StyledPressable className="absolute left-4 px-6" onPress={handleBack}>
        <Ionicons name="chevron-back" size={24} color="#E7DBCB" />
      </StyledPressable>
      <StyledText style={{ fontFamily: "PragmaticaExtended" }} className="text-3xl text-secondary">
        SETTINGS
      </StyledText>
    </StyledMotiView>
  );
}
