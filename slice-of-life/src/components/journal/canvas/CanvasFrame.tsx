import { CanvasFrame } from "@/src/types/shared.types";
import { View } from "react-native";

export default function CanvasFrameHolder({ key, item }: { key: string; item: CanvasFrame }) {
  return <View style={{ flex: 1, backgroundColor: "white" }} />;
}
