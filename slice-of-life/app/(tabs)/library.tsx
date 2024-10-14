import TestFrame from "@/src/components/journal/canvas/TestFrame";
import { CanvasFrame } from "@/src/types/shared.types";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function LibraryScreen() {
  let item: CanvasFrame = {
    id: 1,
    type: "frame",
    dbId: 1,
    path: "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/frames/Frame_Film_01.png",
    width: 200,
    height: 200,
    rotation: 0,
    scale: 1,
    x: 0,
    y: 0,
    z: 0,
    slots: [
      {
        maskPath:
          "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/frames/public/masks/Frame_Film_01_Mask.png",
        image: {
          url: "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/sign/book_photos/1/33/party.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJib29rX3Bob3Rvcy8xLzMzL3BhcnR5LmpwZyIsImlhdCI6MTcyODg1MjUyNCwiZXhwIjoxNzI5NDU3MzI0fQ.xOCp9MKQGYGd2uf90ApS6jc9E7xNI2p4FEj_AFov_Qw&t=2024-10-13T20%3A48%3A44.611Z",
          width: 100,
          height: 100,
          scale: 1,
          rotation: 0,
          x: 0,
          y: 0,
        },
      },
    ],
  };
  return (
    <View style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TestFrame item={item} />
      </GestureHandlerRootView>
    </View>
  );
}
