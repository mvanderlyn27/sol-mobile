import { View, Pressable, Dimensions } from "react-native";
import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { BottomBarTab, BottomDrawerType, ButtonType } from "@/src/types/shared.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { BlurView } from "expo-blur";
import { router, usePathname } from "expo-router";
import { uiStore$ } from "@/src/stores/UIStore";
import { observer } from "@legendapp/state/react";
import { beginBatch, endBatch } from "@legendapp/state";
const StyledAnt = styled(AntDesign);
const StyledMaterial = styled(MaterialIcons);
const StyledMaterialCommunity = styled(MaterialCommunityIcons);
const StyledFeather = styled(Feather);
const StyledMotiView = styled(MotiView);
const StyledView = styled(View);
const { width, height } = Dimensions.get("window");
const StyledBlurView = styled(BlurView);
const NavigationBar = observer(function NavigationBar() {
  const curRoute = usePathname();
  const display = uiStore$.displayNavigationBar.get();
  const handleJournal = () => {
    if (curRoute !== "/journal") {
      router.push("/journal");
    }
    beginBatch();
    uiStore$.displayNavigationBar.set(false);
    uiStore$.displayJournalMenu.set(true);
    endBatch();
  };
  return (
    <AnimatePresence>
      {display && (
        <StyledMotiView
          key="bottom-bar"
          className="absolute bottom-6 right-4 left-4 rounded-xl overflow-hidden z-10"
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 20 }}
          exitTransition={{ type: "timing", duration: 200 }}
          transition={{ type: "timing", duration: 200 }}>
          <StyledBlurView intensity={80} tint="dark" className="p-6 flex-1">
            <StyledMotiView key="bottom-bar" className="  flex-row justify-between items-center ">
              <BottomBarButton selected={false} onPress={handleJournal} buttonType={ButtonType.Template} />
              <BottomBarButton
                selected={false}
                onPress={() => router.push("/calendar")}
                buttonType={ButtonType.Template}
              />
              <BottomBarButton
                selected={false}
                onPress={() => router.push("/profile")}
                buttonType={ButtonType.Template}
              />
            </StyledMotiView>
          </StyledBlurView>
        </StyledMotiView>
      )}
    </AnimatePresence>
  );
});

function BottomBarButton({
  onPress,
  disabled = false,
  buttonType,
  selected = false,
}: {
  onPress: () => void;
  disabled?: boolean;
  buttonType: ButtonType;
  selected?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const getButtonIcon = () => {
    switch (buttonType) {
      case "text":
        return (
          <StyledMaterial name="text-fields" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />
        );
      case "save":
        return <StyledMaterialCommunity name="content-save-outline" size={24} className="text-primary" />;
      case "frame":
        return <StyledFeather name="image" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />;
      case "template":
        return <StyledFeather name="layout" size={24} className={selected ? "text-darkPrimary" : "text-secondary"} />;
      case "x":
        return <StyledAnt name="closecircleo" size={24} className="text-red-500" />;

      default:
        return null;
    }
  };
  const getButtonColor = () => {
    if (selected) {
      return "bg-secondary";
    } else {
      return "bg-clear";
    }
  };

  return (
    <Pressable onPress={disabled ? () => {} : onPress}>
      <StyledMotiView
        className={` w-[40px] h-[40px] rounded-full ${getButtonColor()} items-center justify-center`}
        from={{ scale: 1 }}
        animate={disabled ? {} : { scale: isPressed ? 1.2 : 1 }} // Scale up when pressed
        transition={{
          type: "spring",
          damping: 10,
          stiffness: 150,
        }}>
        {getButtonIcon()}
      </StyledMotiView>
    </Pressable>
  );
}

export default NavigationBar;
