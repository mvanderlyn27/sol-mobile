import { QuickActionInfo } from "@/src/types/shared.types";
import { Pressable, Text } from "react-native";
import { styled } from "nativewind";
import { MotiView } from "moti";
import { useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
const StyledPressable = styled(Pressable);
const StyledMotiView = styled(MotiView);
const StyledFeather = styled(Feather);
const StyledMaterial = styled(MaterialIcons);
const StyledText = styled(Text);
export default function QuickAction({ action }: { action: QuickActionInfo }) {
  const [isPressed, setIsPressed] = useState(false);
  const getIcon = () => {
    switch (action.icon) {
      case "photo":
        return <StyledFeather name="camera" size={50} color={"#F99603"} />;
      case "templates":
        return <StyledFeather name="layout" size={50} color={"#F99603"} />;
      case "text":
        return <StyledMaterial name="text-fields" size={50} color={"#F99603"} />;
      default:
        return null;
    }
  };
  const getLabel = () => {
    return <StyledText className="text-white">{action.label}</StyledText>;
  };
  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200); // Reset the animation state after 200ms
    action.onPress(); // Trigger the passed click handler
  };
  return (
    <StyledPressable onPress={handlePress}>
      <StyledMotiView
        className={` w-[150px] h-[150px] rounded-full bg-black items-center justify-center my-[10px]`}
        from={{ scale: 1 }}
        animate={{ scale: isPressed ? 1.1 : 1 }} // Scale up when pressed
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 150,
        }}>
        {getIcon()}
        {getLabel()}
      </StyledMotiView>
    </StyledPressable>
  );
}
