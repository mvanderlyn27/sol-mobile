import { View, Text, Button, Pressable } from "react-native";
import { Link } from "expo-router";
import { getImageFromPath } from "@/src/assets/images/images";
import { styled } from "nativewind";
import { MotiView, SafeAreaView } from "moti";
import { useData } from "@/src/contexts/DataProvider";
import { useAuth } from "@/src/contexts/AuthProvider";
import React, { useEffect, useState } from "react";
import { useNav } from "@/src/contexts/NavigationProvider";
import { router } from "expo-router";
import { ImageBackground } from "expo-image";
import SettingsTopBar from "../settings/SettingsTopBar";
import Accordion from "react-native-collapsible/Accordion";
import AntDesign from "@expo/vector-icons/AntDesign";
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledMotiView = styled(MotiView);
const StyledSafeAreaView = styled(SafeAreaView);
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import AccountSection from "../settings/AccountSection";
import HelpSection from "../settings/HelpSection";
import AboutSection from "../settings/AboutSection";
export default function SettingsScreen() {
  const sections = [
    {
      title: "ACCOUNT",
      content: <AccountSection />,
      iconActive: <MaterialCommunityIcons name="account-circle-outline" size={30} color="#262326" />,
      iconInactive: <MaterialCommunityIcons name="account-circle-outline" size={30} color="#E7DBCB" />,
    },
    {
      title: "HELP & SUPPORT",
      content: <HelpSection />,
      iconActive: <MaterialIcons name="question-answer" size={30} color="#262326" />,
      iconInactive: <MaterialIcons name="question-answer" size={30} color="#E7DBCB" />,
    },
    {
      title: "ABOUT",
      content: <AboutSection />,
      iconActive: <Feather name="info" size={30} color="#262326" />,
      iconInactive: <Feather name="info" size={30} color="#E7DBCB" />,
    },
  ];
  const [activeSections, setActiveSections] = useState<number[]>([]);

  function renderHeader(section: any, index: number, isActive: boolean) {
    return (
      <StyledView
        className={`p-4 border-b-2 border-secondary flex-row gap-4 items-center ${
          isActive && false ? "bg-secondary" : ""
        }`}>
        {isActive && false ? section.iconActive : section.iconInactive}
        <StyledText
          className={`font-xl ${isActive && false ? "text-darkPrimary" : "text-secondary"}`}
          style={{ fontFamily: "PragmaticaExtended" }}>
          {section.title}
        </StyledText>
        <StyledMotiView className="absolute right-8">
          <AntDesign name={isActive ? "up" : "down"} size={20} color={isActive || true ? "#E7DBCB" : "#262326"} />
        </StyledMotiView>
      </StyledView>
    );
  }

  function renderContent(section: any, index: number, isActive: boolean) {
    return <StyledView className="p-4">{section.content}</StyledView>;
  }
  return (
    <StyledView className="flex-1">
      <ImageBackground source={getImageFromPath("bg_03")} resizeMode="cover" style={{ flex: 1 }}>
        <StyledMotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 1000 }}
          className="flex-1 justify-top items-center">
          <StyledSafeAreaView className="absolute top-0 left-0 right-0 p-4 flex-col">
            <SettingsTopBar />
            <Accordion
              align="top"
              sections={sections}
              activeSections={activeSections}
              renderHeader={renderHeader}
              renderContent={renderContent}
              onChange={(sections) => setActiveSections(sections)}
              sectionContainerStyle={{}}
            />
          </StyledSafeAreaView>
        </StyledMotiView>
      </ImageBackground>
    </StyledView>
  );
}
