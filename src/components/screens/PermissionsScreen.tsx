import { getImageFromPath } from "@/src/assets/images/images";
import { posthog } from "@/src/services/Posthog";
import { checkNotificationStatus, scheduleDailyReminder } from "@/src/services/PushNotification";
import { generateId } from "@/src/stores/AsyncStorage";
import authStore$ from "@/src/stores/AuthStore";
import { addNotification } from "@/src/stores/NotificationStore";
import { profiles$, requestPushNotificationPermission, updateUsername } from "@/src/stores/ProfileStore";
import { NotificationType } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import { email } from "@snaplet/copycat/dist/email";
import { Link, router } from "expo-router";
import { MotiView, View } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { TextInput, Pressable, Text, ImageBackground } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const StyledMotiView = styled(MotiView);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);
const PermissionsScreen = observer(function FtuxScreen() {
  // form to setup username

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);
  const handleContinue = () => {
    const userId = authStore$.session.user.id.get();
    if (!userId) {
      addNotification({
        id: generateId(),
        type: NotificationType.error,
        message: "Failed to continue, please log in again",
      });
      posthog.capture("push-notification-setup-failed", { message: "not logged in" });
      router.navigate("/login");
      return;
    }
    profiles$[userId].new.set(false);
    router.replace("/home");
  };
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = async (date: Date) => {
    await scheduleDailyReminder(date.getHours(), date.getMinutes());
    hideDatePicker();
  };
  const handleEnablePermissions = async () => {
    const granted = await requestPushNotificationPermission();
    if (granted) {
      setPushNotificationEnabled(true);
    }
  };
  return (
    <ImageBackground
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
      source={getImageFromPath("bg_03")}>
      <StyledText
        className="text-3xl tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended" }}>
        Permissions
      </StyledText>
      <StyledPressable
        onPress={handleEnablePermissions}
        className={`w-full py-3 my-4  ${"bg-primary"} border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-white" style={{ fontFamily: "PragmaticaExtended" }}>
          ENABLE NOTIFICATIONS
        </StyledText>
      </StyledPressable>
      <StyledPressable
        onPress={showDatePicker}
        disabled={!pushNotificationEnabled}
        className={`w-full py-3 my-4  ${
          pushNotificationEnabled ? "bg-primary" : "bg-gray-400"
        } border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-white" style={{ fontFamily: "PragmaticaExtended" }}>
          SET DAILY JOURNAL REMINDER
        </StyledText>
      </StyledPressable>
      <StyledPressable
        onPress={handleContinue}
        className={`w-full py-3 my-4  ${"bg-secondary"} border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          CONTINUE
        </StyledText>
      </StyledPressable>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </ImageBackground>
  );
});
export default PermissionsScreen;
