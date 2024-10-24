import { AnimatePresence, MotiView } from "moti";
import { styled } from "nativewind";
import { useState } from "react";
import SignupForm from "../auth/SignupForm";
import LoginForm from "../auth/LoginForm";
import { Text, SafeAreaView, Pressable } from "react-native";
const StyledMotiView = styled(MotiView);
const StyledText = styled(Text);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledPressable = styled(Pressable);
export default function LoginScreen() {
  //login | signup
  const [selectedTab, setSelectedTab] = useState("login");
  return (
    <StyledSafeAreaView className="absolute top-0 left-0 right-0 bottom-0">
      <StyledText
        className="text-4xl tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended-bold" }}>
        SLICE OF LIFE
      </StyledText>
      <StyledText
        className="text-[10px] tracking-widest text-secondary text-center"
        style={{ fontFamily: "PragmaticaExtended" }}>
        ORDINARY. MUNDANE. BUT UNIQUELY YOURS
      </StyledText>
      <StyledMotiView className="flex-1 flex-col px-10 justify-center items-center">
        <StyledMotiView className="flex-row items-center border border-secondary rounded-xl py-2 my-4 relative ">
          {/* Animated Sliding View */}
          <StyledMotiView
            animate={{
              left: selectedTab === "signup" ? 0 : "50%", // Moves from left-0 to right-0
              borderTopLeftRadius: selectedTab !== "signup" ? 0 : 12,
              borderBottomLeftRadius: selectedTab !== "signup" ? 0 : 12,
              borderTopRightRadius: selectedTab === "signup" ? 0 : 12,
              borderBottomRightRadius: selectedTab === "signup" ? 0 : 12,
            }}
            transition={{ type: "spring", damping: 15 }}
            className="absolute top-0 bottom-0 w-1/2 bg-secondary rounded-xl"
          />

          {/* Sign Up Button */}
          <StyledPressable className="flex-1 items-center justify-center py-2" onPress={() => setSelectedTab("signup")}>
            <StyledText
              className={`font-bold ${selectedTab === "signup" ? "text-darkPrimary" : "text-secondary"}`}
              style={{ fontFamily: "PragmaticaExtended" }}>
              SIGN UP
            </StyledText>
          </StyledPressable>

          {/* Log In Button */}
          <StyledPressable className="flex-1 items-center justify-center py-2" onPress={() => setSelectedTab("login")}>
            <StyledText
              className={`font-bold ${selectedTab === "login" ? "text-darkPrimary" : "text-secondary"}`}
              style={{ fontFamily: "PragmaticaExtended" }}>
              LOG IN
            </StyledText>
          </StyledPressable>
        </StyledMotiView>
        <AnimatePresence exitBeforeEnter>
          {selectedTab === "signup" && (
            <MotiView
              key="sign up"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 500 }}>
              <SignupForm />
            </MotiView>
          )}
          {selectedTab === "login" && (
            <MotiView
              key="login"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 500 }}>
              <LoginForm />
            </MotiView>
          )}
        </AnimatePresence>
      </StyledMotiView>
    </StyledSafeAreaView>
  );
}
