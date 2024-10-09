import { CanvasText } from "@/src/types/shared.types";
import { View } from "react-native";

export default function CanvasTextHolder({ key, item }: { key: string; item: CanvasText }) {
  return <View style={{ flex: 1, backgroundColor: "white" }} />;
}
