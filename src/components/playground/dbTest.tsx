import { observer } from "@legendapp/state/react";
import { View, Text, Pressable } from "react-native";
import { styled } from "nativewind";
import { addBook, books$, deleteBook } from "@/src/stores/BookStore";
import { Book } from "@/src/types/shared.types";
import { SafeAreaView } from "react-native-safe-area-context";
import RectangleButton from "../shared/RectangleButton";
import { useEffect } from "react";
import LogoutButton from "../auth/LogoutButton";
import { observe, syncState } from "@legendapp/state";
const StyledView = styled(View);
const StyledPressable = styled(Pressable);
const DbTest = observer(function DbTest() {
  const books = books$.get() as Record<string, Book>; // Assuming books$ returns an array of Book
  const handleAddBook = () => {
    console.log("add book");
    addBook("defaultJournal");
  };
  const handleRemoveBook = (id: string) => {
    console.log("add book");
    deleteBook(id);
  };
  const status$ = syncState(books$);
  observe(() => {
    const { isLoaded, error } = status$.get();
    if (error) {
      console.error("Sync error:", error);
    }
  });
  return (
    <StyledView className="flex-1 bg-red-100 flex-col">
      <SafeAreaView style={{ flex: 1 }} pointerEvents="auto">
        <StyledView className="flex-col gap-2 flex-1">
          {books &&
            Object.values(books).map((book: Book, index) => (
              <StyledPressable
                key={index}
                className="p-4 rounded-full overflow-hidden bg-slate-500"
                onPress={() => handleRemoveBook(book?.id)}>
                <Text>{book?.id}</Text>
              </StyledPressable>
            ))}
        </StyledView>
        <RectangleButton
          action={handleAddBook}
          disabled={false}
          color={"bg-blue-500"}
          textColor={""}
          text={"add book"}
        />
        <LogoutButton />
      </SafeAreaView>
    </StyledView>
  );
});
export default DbTest;
