import { useDatabase } from "@nozbe/watermelondb/react";
import RectangleButton from "../shared/RectangleButton";
import Page from "@/src/localDb/models/Page";
import Canvas from "../journal/canvas/Canvas";
import { CanvasItem, ImageType } from "@/src/types/shared.types";
import { Dimensions } from "react-native";

export default function AddButton({ disabled, bookId }: { disabled: boolean | undefined; bookId: string | undefined }) {
  const database = useDatabase();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const defaultCanvas = {
    backgroundImage: { path: "bg_04", type: ImageType.Local },
    items: [] as CanvasItem[],
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    curId: 0,
    maxZIndex: 0,
  };
  const handleAdd = async () => {
    console.log("clicked, " + bookId);
    if (!bookId) return;
    const page = await database.write(async () => {
      const newPage = await database.get<Page>("pages").create((page) => {
        page.date = new Date().toISOString().split("T")[0]; // Store date as YYYY-MM-DD
        page.canvas = defaultCanvas; // Initialize empty JSON object for canvas
        page.bookId = bookId; // Set association
      });
      return newPage;
    });
    console.log("new page", page);
  };

  return <RectangleButton disabled={disabled || false} action={handleAdd} text="Add" color="" textColor="" />;
}
