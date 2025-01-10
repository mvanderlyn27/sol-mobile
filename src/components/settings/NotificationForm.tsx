import { getImageFromPath } from "@/src/assets/images/images";
import { posthog } from "@/src/services/Posthog";
import { requestPushNotificationPermission } from "@/src/services/Profile";
import {
  checkNotificationStatus,
  registerForPushNotificationsAsync,
  scheduleDailyReminder,
} from "@/src/services/PushNotification";
import { generateId } from "@/src/stores/AsyncStorage";
import authStore$ from "@/src/stores/AuthStore";
import { addNotification } from "@/src/stores/NotificationStore";
import { profiles$ } from "@/src/stores/ProfileStore";
import { NotificationType } from "@/src/types/shared.types";
import { observer } from "@legendapp/state/react";
import { email } from "@snaplet/copycat/dist/email";
import { Link, router } from "expo-router";
import { MotiView, View } from "moti";
import { styled } from "nativewind";
import { useEffect, useState } from "react";
import { TextInput, Pressable, Text, ImageBackground, Switch } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ModalButton from "../shared/ModalButton";
import * as Notifications from "expo-notifications";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledLink = styled(Link);
const NotificationForm = observer(function FtuxScreen() {
  // form to setup username
  const [devicePushNotificationStatus, setDevicePushNotificationStatus] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const pushNotificationEnabled = profiles$[authStore$.session.user.id.get() || ""].push_enabled.get();
  const getDevicePushNotificationStatus = async () => {
    const userId = authStore$.session.user.id.get();
    if (!userId) {
      console.log("no user logged in");
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    const existingStatus = status === "granted";
    setDevicePushNotificationStatus(existingStatus);
    if (!existingStatus) {
      //user has push notifications off
      profiles$[userId].push_enabled.set(false);
    }
  };
  useEffect(() => {
    getDevicePushNotificationStatus();
  }, []);
  //   const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);
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
  const handleTogglePermissions = async () => {
    const userId = authStore$.session.user.id.get();
    if (!userId) {
      console.log("no user");
      return;
    }
    if (devicePushNotificationStatus === false && pushNotificationEnabled === false) {
      //first time need to request
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        //user didn't give permission
        profiles$[userId].push_enabled.set(false);
        return;
      }
    }
    //otherwise toggle notification
    profiles$[userId].push_enabled.set(!pushNotificationEnabled);
    addNotification({
      id: generateId(),
      type: NotificationType.info,
      message: `Push notifications ${!pushNotificationEnabled ? "enabled" : "disabled"}`,
    });
  };
  return (
    <StyledView className="flex-col justify-center items-center">
      <StyledView className="flex-row justify-center items-center py-2">
        {/* <ModalButton
          action={handleEnablePermissions}
          disabled={!pushNotificationEnabled}
          text={"Enable Push Notifications"}
        /> */}
        <StyledText className="text-secondary text-md font-bold flex-1 text-left">Push Notifications</StyledText>
        <Switch
          onValueChange={handleTogglePermissions}
          value={pushNotificationEnabled}
          //   trackColor={{ false: "#767577", true: "#767577" }}
          //   thumbColor={pushNotificationEnabled ? "#f5dd4b" : "#f4f3f4"}
        />
      </StyledView>
      <StyledView className="flex-row py-2">
        <ModalButton
          action={showDatePicker}
          text={"Reset Daily Reminder"}
          color="bg-secondary"
          textColor="text-darkPrimary"
          disabled={!pushNotificationEnabled}
        />
      </StyledView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </StyledView>
  );
});
export default NotificationForm;
