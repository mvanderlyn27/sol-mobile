import { View } from "moti";
import { Text } from "react-native";
import { Link } from "expo-router";
import { styled } from "nativewind";
// import AddButton from "@/src/components/dbTest/AddButton";
import { useEffect, useState } from "react";
// import Book from "@/src/localDb/models/Book";
import { BookType } from "@/src/types/shared.types";
// import Page from "@/src/localDb/models/Page";
import { create } from "react-test-renderer";
// import EnhancedViewData from "@/src/components/dbTest/ViewData";
import JournalScreen from "@/src/components/screens/JournalScreen";

const StyledView = styled(View);

export default function Journal() {
  //   const [books, setBooks] = useState<Book[] | null>(null);
  //   const [pages, setPages] = useState<Page[] | null>(null);
  //   const [book, setBook] = useState<Book | null>(null);

  //   const createBook = async () => {
  //     console.log("creating book");
  //     const newBook = await db.write(async () => {
  //       const newBookRecord = await db.get<Book>("books").create((newBookRecord) => {
  //         newBookRecord.type = "journal";
  //       });
  //       return newBookRecord;
  //     });
  //     setBook(newBook);
  //   };
  //   const getData = async () => {
  //     console.log("getting data");
  //     const books = await db.get<Book>("books").query().fetch();
  //     const pages = await db.get<Page>("pages").query().fetch();
  //     if (!books) {
  //       createBook();
  //     } else {
  //       setBook(books[0]);
  //       console.log("cur book", books[0]);
  //     }
  //     setBooks(books);
  //     setPages(pages);
  //   };
  //   useEffect(() => {
  //     console.log("getting data");
  //     getData();
  //   }, []);
  //   createBook();

  return (
    <StyledView className="flex-1 justify-center">
      <JournalScreen />
    </StyledView>
  );
}
