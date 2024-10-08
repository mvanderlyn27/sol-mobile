//provider for sharing out all data related to the backend
//should have loading and error states for each data type needed
//

// src/context/DataProvider.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import {
  Book,
  CreateBookInput,
  CreatePageInput,
  Font,
  Frame,
  Page,
  Profile,
  Template,
  UpdateProfileInput,
} from "../types/shared.types";
import BookService from "../api/book";
import FontService from "../api/font";
import TemplateService from "../api/template";
import FrameService from "../api/frame";
import PageService from "../api/page";
import ProfileService from "../api/profile";
import StorageService from "../api/storage";

interface DataContextType {
  //books
  books: Book[];
  currentBook: number | null;
  booksLoading: boolean;
  booksError: string | null;
  fetchBooks: () => void;
  deleteBook: (id: number) => void;
  updateBook: (id: number, content: Book) => void;
  createBook: (content: Book) => void;
  selectBook: (ind: number) => void;
  //fonts
  fonts: Font[];
  fontsLoading: boolean;
  fontsError: string | null;
  fetchFonts: () => void;
  //frames
  frames: Frame[];
  framesLoading: boolean;
  framesError: string | null;
  fetchFrames: () => void;
  // pages
  pagesMap: Map<Date, Page>;
  selectedDate: Date | null;
  pagesLoading: boolean;
  pagesError: string | null;
  fetchPagesMap: () => void;
  createPage: (date: Date, content: CreatePageInput) => void;
  updatePage: (date: Date, content: Page) => void;
  deletePage: (date: Date) => void;
  setCurrentPage: (date: Date) => void;
  //profile
  profile: Profile | null;
  profileLoading: boolean;
  profileError: string | null;
  fetchProfile: () => void;
  updateProfile: (content: UpdateProfileInput) => void;
  //template
  templates: Template[];
  templatesLoading: boolean;
  templatesError: string | null;
  fetchTemplates: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  //book state
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBook] = useState<number | null>(null);
  const [booksLoading, setBooksLoading] = useState<boolean>(false);
  const [booksError, setBooksError] = useState<string | null>(null);
  //font state
  const [fonts, setFonts] = useState<Font[]>([]);
  const [fontsLoading, setFontsLoading] = useState<boolean>(false);
  const [fontsError, setFontsError] = useState<string | null>(null);
  //frame state
  const [frames, setFrames] = useState<Frame[]>([]);
  const [framesLoading, setFramesLoading] = useState<boolean>(false);
  const [framesError, setFramesError] = useState<string | null>(null);
  //page state
  const [pagesMap, setPageMap] = useState<Map<Date, Page>>(new Map<Date, Page>());
  // MIGHT NEED A DEFAULT VALUE OF THE DAY MINUS HOURS/MINUTES
  //Might also not need to be in this provider, maybe have it just in the journal page?
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pagesLoading, setPagesLoading] = useState<boolean>(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  //profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  //template state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [session]);
  const loadData = async () => {
    if (session) {
      await fetchBooks();
      //should have a selected book after fetching books
      if (currentBook) {
        await fetchPagesMap();
      }
      await Promise.all([fetchTemplates(), fetchFrames(), fetchFonts(), fetchProfile()]);
    }
  };
  //book functions
  const fetchBooks = async () => {
    setBooksLoading(true);
    setBooksError(null);
    const { data, error } = await BookService.getBooks();
    if (error) {
      setBooksError(error);
      setBooksLoading(false);
      return;
    } else if (!data) {
      setBooksLoading(false);
      return;
    }
    setBooks(data);
    setBooksLoading(false);
    setBooksLoading(false);
  };

  const deleteBook = async (id: number) => {
    const { error } = await BookService.deleteBook(id);
    if (error) {
      console.error("Error deleting Book:", error);
      return;
    }
    if (currentBook === id) {
      setCurrentBook(null);
      setPageMap(new Map<Date, Page>());
    }
    await fetchBooks();
  };
  const updateBook = async (id: number, content: Book) => {
    const { error } = await BookService.updateBook(id, content);
    if (error) {
      console.error("Error updating Book:", error);
      return;
    }
    await fetchBooks();
  };
  const createBook = async (content: CreateBookInput) => {
    const { error } = await BookService.createBook(content);
    if (error) {
      console.error("Error creating Book:", error);
      return;
    }
    await fetchBooks();
  };
  const selectBook = (ind: number) => {
    if (ind < 0 || ind >= books.length) {
      setBooksError("Invalid book index");
      return;
    }
    setCurrentBook(ind);
    fetchPagesMap();
  };
  // font functions
  const fetchFonts = async () => {
    setFontsLoading(true);
    setFontsError(null);
    const { data, error } = await FontService.getFonts();
    if (error) {
      setFontsError(error);
      setFontsLoading(false);
      return;
    } else if (!data) {
      setFontsLoading(false);
      return;
    }
    setFonts(data);
    setFontsLoading(false);
    setFontsLoading(false);
  };
  // frame functions
  const fetchFrames = async () => {
    setFramesLoading(true);
    setFramesError(null);
    const { data, error } = await FrameService.getFrames();
    if (error) {
      setFramesError(error);
      setFramesLoading(false);
      return;
    } else if (!data) {
      setFramesLoading(false);
      return;
    }
    setFrames(data);
    setFramesLoading(false);
    setFramesLoading(false);
  };
  // page functions
  const fetchPagesMap = async () => {
    setPagesLoading(true);
    setPagesError(null);
    const { data, error } = await PageService.getPages();
    if (error) {
      setPagesError(error);
      setPagesLoading(false);
      return;
    } else if (!data) {
      setPagesLoading(false);
      return;
    }
    setPageMap(new Map(data.map((page) => [new Date(page.date), page])));
    setPagesLoading(false);
    setPagesLoading(false);
  };
  const createPage = async (date: Date, content: CreatePageInput) => {
    setPagesLoading(true);
    setPagesError(null);
    const { data, error } = await PageService.createPage(content);
    if (error) {
      setPagesError(error);
      setPagesLoading(false);
      return;
    } else if (!data) {
      setPagesLoading(false);
      return;
    }
    setPageMap(new Map([...pagesMap!, [new Date(data.date), data]]));
    setPagesLoading(false);
  };
  const updatePage = async (date: Date, content: Page) => {
    if (!pagesMap.has(date)) {
      setPagesError("Can't updaate, page does not exist yet");
      return;
    }
    setPagesLoading(true);
    setPagesError(null);
    const { data, error } = await PageService.updatePage(content.id, content);
    if (error) {
      setPagesError(error);
      setPagesLoading(false);
      return;
    } else if (!data) {
      setPagesLoading(false);
      return;
    }
    pagesMap!.set(new Date(data.date), data);
    setPageMap(pagesMap!);
    setPagesLoading(false);
  };
  const deletePage = async (date: Date) => {
    if (!pagesMap.has(date)) {
      setPagesError("Can't delete, page does not exist yet");
      return;
    }
    setPagesLoading(true);
    setPagesError(null);
    const page = pagesMap.get(date)!;
    const { data, error } = await PageService.deletePage(page.id);
    if (error) {
      setPagesError(error);
      setPagesLoading(false);
      return;
    } else if (!data) {
      setPagesLoading(false);
      return;
    }
    pagesMap!.delete(date);
    setPageMap(pagesMap!);
    setPagesLoading(false);
  };
  const setCurrentPage = (date: Date) => {
    if (!pagesMap.has(date)) {
      setPagesError("Can't set current page, page does not exist yet");
      return;
    }
    setSelectedDate(date);
  };
  // profile functions
  const fetchProfile = async () => {
    if (!session) {
      setProfileError("no user logged in");
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    const { data, error } = await ProfileService.getProfile(session.user.id);
    if (error) {
      setProfileError(error);
      setProfileLoading(false);
      return;
    } else if (!data) {
      setProfileLoading(false);
      return;
    }
    setProfile(data);
    setProfileLoading(false);
    setProfileLoading(false);
  };
  const updateProfile = async (content: UpdateProfileInput) => {
    setProfileLoading(true);
    setProfileError(null);
    if (!profile) {
      setProfileError("no user logged in");
      return;
    }
    let publicFilePath = null;
    if (content.file) {
      const filePath = `${profile.id}/${content.file.name}`;
      const uploadResponse = await StorageService.uploadFile("avatars", filePath, content.file);

      if (!uploadResponse.success || !uploadResponse.data) {
        setProfileError(uploadResponse.error || "Failed to upload avatar image.");
        setProfileLoading(false);
        return;
      }
      const urlResponse = await StorageService.getPublicUrl("avatars", filePath);
      if (!urlResponse.success || !urlResponse.data) {
        setProfileError(urlResponse.error || "Failed to generate public URL for the avatar image.");
        setProfileLoading(false);
        return;
      }
      publicFilePath = urlResponse.data;
    }
    let updateContent: Profile = { ...profile };
    let hasChanges = false;
    if (content.name && content.name !== profile.name) {
      updateContent.name = content.name;
      hasChanges = true;
    }
    if (publicFilePath && publicFilePath !== profile.avatar_url) {
      updateContent.avatar_url = publicFilePath;
      hasChanges = true;
    }
    if (!hasChanges) {
      const { data, error } = await ProfileService.updateProfile(profile.id, updateContent);
      if (error) {
        setProfileError(error);
        setProfileLoading(false);
        return;
      } else if (!data) {
        setProfileLoading(false);
        return;
      }
      setProfile(data);
    }
    setProfileLoading(false);
  };
  // template functions
  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    const { data, error } = await TemplateService.getTemplates();
    if (error) {
      setTemplatesError(error);
      setTemplatesLoading(false);
      return;
    } else if (!data) {
      setTemplatesLoading(false);
      return;
    }
    setTemplates(data);
    setTemplatesLoading(false);
    setTemplatesLoading(false);
  };

  //helper functions
  const dateToString = (date: Date): string => {
    return "";
  };
  const stringToDate = (date: Date): Date => {
    return new Date();
  };

  return (
    <DataContext.Provider
      value={{
        books,
        currentBook,
        booksLoading,
        booksError,
        fetchBooks,
        deleteBook,
        updateBook,
        createBook,
        selectBook,
        //fonts
        fonts,
        fontsLoading,
        fontsError,
        fetchFonts,
        //frames
        frames,
        framesLoading,
        framesError,
        fetchFrames,
        // pages
        pagesMap,
        selectedDate,
        pagesLoading,
        pagesError,
        fetchPagesMap,
        createPage,
        updatePage,
        deletePage,
        setCurrentPage,
        //profile
        profile,
        profileLoading,
        profileError,
        fetchProfile,
        updateProfile,
        //template
        templates,
        templatesLoading,
        templatesError,
        fetchTemplates,
      }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
