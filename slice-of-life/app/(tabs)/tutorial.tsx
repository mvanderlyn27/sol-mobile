import TutorialScreen from "@/src/components/screens/TutorialScreen";
import { useData } from "@/src/contexts/DataProvider";
import { Text } from "react-native";
import PagerView from "react-native-pager-view";
export default function Tutorial() {
  const { profile, updateProfile } = useData();
  if (profile?.new) {
    updateProfile({ new: false });
  }
  return <TutorialScreen />;
}
