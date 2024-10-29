import { database } from "@/src/localDb/database";
import { Q } from "@nozbe/watermelondb";
import Page from "../localDb/models/Page";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
//page section

const defaultCanvas: Canvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [] as CanvasItem[],
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  curId: 0,
  maxZIndex: 0,
};
export const fetchPageByDay = async (date: string): Promise<Page | null> => {
  const page = (await database.get("pages").query(Q.where("date", date)).fetch()) as Page[];
  //update to have better structure, and error/succcess
  if (!page) return null;
  console.log(page.map((p) => p.date));
  return page[0];
};
export const insertDefaultPageByDay = async (date: string): Promise<Page | null> => {
  return await database.write(async () => {
    const newPage = await database.get<Page>("pages").create((page) => {
      page.date = date;
      page.canvas = defaultCanvas;
    });
    return newPage;
  });
};
