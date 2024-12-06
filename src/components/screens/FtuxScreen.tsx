import { getImageFromPath } from "@/src/assets/images/images";
import { scheduleDailyReminder } from "@/src/services/PushNotification";
import { generateId } from "@/src/stores/AsyncStorage";
import { addNotification } from "@/src/stores/NotificationStore";
import { requestPushNotificationPermission, updateUsername } from "@/src/stores/ProfileStore";
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
const FtuxScreen = observer(function FtuxScreen() {
  // form to setup username
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const handleUsername = () => {
    setLoading(true);
    //test username and change
    const { error } = updateUsername(username);
    if (error) {
      setError(error);
      addNotification({ id: generateId(), message: error, type: NotificationType.error });
      setLoading(false);
    } else {
      setLoading(false);
      router.replace("./permissions");
    }
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
  const handleEnablePermissions = () => {
    requestPushNotificationPermission();
  };
  return (
    <ImageBackground
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
      source={getImageFromPath("bg_03")}>
      <StyledText
        className="text-3xl tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended" }}>
        Choose Username
      </StyledText>
      <StyledMotiView
        className="w-full border border-gray-400 rounded-lg flex-row items-center justify-between p-4 my-4"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "timing", duration: 300 }}>
        <StyledTextInput
          value={username}
          placeholder="USERNAME"
          placeholderTextColor="#B0B0B0"
          onChangeText={setUsername}
          className="w-full text-secondary text-center"
          style={{ fontFamily: "PragmaticaExtended-light" }}
          autoCapitalize="none"
        />
      </StyledMotiView>
      <StyledPressable
        onPress={handleUsername}
        disabled={loading || !username}
        className={`w-full py-3 my-4  ${
          loading || !username ? "bg-gray-400" : "bg-secondary"
        } border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          CONTINUE
        </StyledText>
      </StyledPressable>
    </ImageBackground>
  );
});
export default FtuxScreen;
