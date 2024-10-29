import { database } from "@/src/localDb/database";
import { Q } from "@nozbe/watermelondb";
import Page from "../localDb/models/Page";
import { Canvas, CanvasItem, ImageType } from "../types/shared.types";
import { Dimensions } from "react-native";
import { useBookStore } from "../stores/BookStore";
import Book from "../localDb/models/Book";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
//book section
export const fetchBookById = async (id: string): Promise<Book | null> => {
  const book = (await database.get("books").query(Q.where("id", id)).fetch()) as Book[];
  if (!book) return null;
  return book[0];
};
export const fetchDefaultBook = async (): Promise<Book | null> => {
  const book = (await database.get("books").query(Q.where("type", "journal")).fetch()) as Book[];
  if (!book) return null;
  return book[0];
};
export const insertDefaultBook = async (): Promise<Book | null> => {
  return await database.write(async () => {
    const newBook = await database.get<Book>("books").create((book) => {
      book.type = "journal";
    });
    return newBook;
  });
};
//page section
const defaultCanvas: Canvas = {
  backgroundImage: { path: "bg_04", type: ImageType.Local },
  items: [] as CanvasItem[],
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  curId: 0,
  maxZIndex: 0,
};
export const fetchPageByDay = async (curBook: Book, date: string): Promise<Page | null> => {
  if (!curBook) {
    console.error("no book selected");
    return null;
  }
  let pageRaw = (await database.get("pages").query(Q.where("date", date)).fetch()) as Page[];
  let page = null;
  if (pageRaw?.length) {
    page = pageRaw[0];
  }
  //update to have better structure, and error/succcess
  if (!page) {
    page = await insertDefaultPageByDay(curBook, date);
  }
  //   console.log(page.map((p) => p.date));
  return page;
};
const insertDefaultPageByDay = async (curBook: Book, date: string): Promise<Page | null> => {
  if (!curBook) {
    console.error("no book selected");
    return null;
  }
  return await database.write(async () => {
    const newPage = await database.get<Page>("pages").create((page) => {
      page.bookId = curBook.id;
      page.date = date;
      page.canvas = defaultCanvas;
    });
    return newPage;
  });
};
