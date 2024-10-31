import { observable } from "@legendapp/state";
import { format, addDays, parseISO } from "date-fns";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const defaultCanvas: Canvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [] as CanvasItem[],
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  curId: 0,
  maxZIndex: 0,
};

const DEFAULT_PAGE = {
  id: "",
  bookId: "",
  canvas: defaultCanvas,
  date: "",
};

export const journalStore$ = observable({
  pagesByDate: {},
  selectedDate: null,
  editMode: true,
});
