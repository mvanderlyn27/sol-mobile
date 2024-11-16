import { getImageFromPath } from "@/src/assets/images/images";
import { updateUsername } from "@/src/stores/ProfileStore";
import { observer } from "@legendapp/state/react";
import { email } from "@snaplet/copycat/dist/email";
import { Link, router } from "expo-router";
import { MotiView, View } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import { TextInput, Pressable, Text, ImageBackground } from "react-native";

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
  const handleUsername = () => {
    setLoading(true);
    //test username and change
    const { error } = updateUsername(username);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setLoading(false);
      router.push("/home");
    }
  };
  return (
    <ImageBackground
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}
      source={getImageFromPath("bg_03")}>
      <StyledMotiView
        className="w-full border border-gray-400 rounded-lg flex-row items-center justify-between p-4"
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
        disabled={loading}
        className={`w-full py-3 my-4  ${
          loading ? "bg-gray-400" : "bg-secondary"
        } border border-darkPrimary rounded-lg`}>
        <StyledText className="text-center text-darkPrimary" style={{ fontFamily: "PragmaticaExtended" }}>
          CONTINUE
        </StyledText>
      </StyledPressable>
    </ImageBackground>
  );
});
export default FtuxScreen;
