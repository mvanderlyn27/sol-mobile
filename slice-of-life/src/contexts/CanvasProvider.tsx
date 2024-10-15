import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Canvas, CanvasItem, ImageType, Page } from "../types/shared.types";
import { useData } from "./DataProvider";
import { Json } from "../types/supabase.types";
import { Dimensions } from "react-native";
import Toast from "react-native-root-toast";
import StorageService from "../api/storage";
import { useAuth } from "./AuthProvider";

interface CanvasContextType {
  canvas: Canvas;
  tempCanvas: Canvas | null;
  editingCanvas: boolean;
  canvasError: string | null;
  canvasLoading: boolean;
  canvasSaving: boolean;
  //id of canvas item we're editing
  curEditingCanvasItem: number | null;
  uploadingImage: boolean;
  canvasHasChanges: boolean;
  setCanvasData: (canvas: Canvas) => void;
  updateCanvasItem: (index: number, newItem: CanvasItem) => void;
  addCanvasItem: (item: CanvasItem) => void;
  removeCanvasItem: (index: number) => void;
  startEditCanvas: () => void;
  saveCanvasEdits: () => void;
  updateCanvasItemImage: (id: number, base64: string, fileName: string, fileExtension: string) => void;
  clearCanvas: () => void;
  exitEditCanvas: () => void;
  loadCanvasFromJsonString: (json: string) => void;
  jsonToCanvas: (json: string) => Canvas | null;
  canvasToJson: (canvas: Canvas) => Json;
  editCanvasItem: (index: number) => void;
  saveCanvasItemEdits: (id: number, updates: CanvasItem) => void;
  exitEditCanvasItem: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const defaultCanvas = {
    backgroundImage: { path: "bg_04", type: ImageType.Local },
    items: [],
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    curId: 0,
    maxZIndex: 0,
  };
  const {
    books,
    currentBook,
    pagesMap,
    pagesLoading,
    selectedDate,
    createPage,
    setCurrentPageDate,
    toDayString,
    updatePage,
    pagesError,
  } = useData();
  const { session } = useAuth();
  // maybe get current page from book/page provider after we seperate them out
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [canvas, setCanvas] = useState<Canvas>(defaultCanvas);
  const [canvasHasChanges, setCanvasHasChanges] = useState<boolean>(false);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [canvasLoading, setCanvasLoading] = useState<boolean>(true);
  const [canvasSaving, setCanvasSaving] = useState<boolean>(false);
  const [tempCanvas, setTempCanvas] = useState<Canvas | null>(null);
  const [editingCanvas, setEditingCanvas] = useState<boolean>(false);
  const [curEditingCanvasItem, setCurEditingCanvasItem] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  useEffect(() => {
    if (selectedDate) {
      setCanvasLoading(true);
    }
  }, [selectedDate]);
  useEffect(() => {
    if (pagesLoading === false && pagesMap && selectedDate) {
      // console.log(pagesMap, pagesMap.get(selectedDate));
      const curPage = pagesMap.get(selectedDate);
      if (curPage) {
        setCurrentPage(curPage);
        setCanvas(defaultCanvas);
        loadCanvasFromJsonString(curPage.canvas as string);
      } else {
        setCurrentPage(null);
        setCanvas(defaultCanvas);
      }
      setCanvasLoading(false);
    }
  }, [pagesMap, selectedDate, pagesLoading]);

  const loadCanvasFromJsonString = (json: string) => {
    if (!json) {
      console.debug("json is empty");
      setCanvasError("json is empty");
      return;
    }
    const newCanvas: Canvas | null = jsonToCanvas(json);
    if (!newCanvas) {
      console.debug("failed parsing json");
      setCanvasError("failed parsing json");
      return;
    }
    setCanvas(newCanvas);
  };
  const setCanvasData = (canvas: Canvas) => {
    setCanvas(canvas);
  };
  const updateCanvasItem = (id: number, newItem: CanvasItem) => {
    // Check if we are in edit mode and tempCanvas is available
    if (!editingCanvas) {
      console.debug("Canvas not in edit mode");
      setCanvasError("Canvas not in edit mode");
      return;
    }
    if (!tempCanvas) {
      console.debug("Update failed, tempCanvas is empty");
      setCanvasError("tempCanvas is empty");
      return;
    }
    // Find the index of the item with the specified id
    const oldItemIndex = tempCanvas.items.findIndex((item) => item.id === id);
    // Validate the index to make sure the item exists
    if (oldItemIndex === -1) {
      console.debug("Invalid id for updating canvas item");
      setCanvasError("Invalid item id");
      return;
    }
    // Calculate the current z-index of the item being updated
    const currentZ = tempCanvas.items[oldItemIndex].z;
    // Determine the new z-index and whether to update the maxZIndex
    let newZ = newItem.z;
    let shouldUpdateMaxZIndex = false;
    if (currentZ < tempCanvas.maxZIndex) {
      newZ = tempCanvas.maxZIndex + 1; // Move item to the top
      shouldUpdateMaxZIndex = true; // Mark that we need to update maxZIndex
    }
    // Update the item's properties while ensuring we keep the same id and other necessary fields
    const updatedItems = tempCanvas.items.map((item, index) => {
      if (index === oldItemIndex) {
        return { ...newItem, z: newZ }; // Update the item with new properties and z-index
      }
      return item; // Keep the existing item unchanged
    });
    // Update the tempCanvas with the new items array
    const newMaxZIndex = shouldUpdateMaxZIndex ? Math.max(tempCanvas.maxZIndex + 1, newZ) : tempCanvas.maxZIndex; // Only update maxZIndex if needed
    setTempCanvas({ ...tempCanvas, maxZIndex: newMaxZIndex, items: updatedItems });
    setCanvasError(null);
    setCanvasHasChanges(true);
    if (uploadingImage) {
      setUploadingImage(false);
    }
  };

  const removeCanvasItem = (id: number) => {
    if (!canvas) {
      console.debug("failed to remove, canvas empty");
      setCanvasError("Canvas is empty");
      return;
    }
    if (!editingCanvas) {
      console.debug("failed to remove, not editing");
      setCanvasError("Canvas not in edit mode");
      return;
    }
    if (!tempCanvas) {
      console.debug("Remove failed, tempCanvas is empty");
      setCanvasError("tempCanvas is empty");
      return;
    }

    // Create a new array with the item removed based on its id
    const updatedItems = tempCanvas.items.filter((item) => item.id !== id);

    setTempCanvas({ ...tempCanvas, items: updatedItems });
    setCanvasHasChanges(true);
    setCanvasError(null);
  };
  const editCanvasItem = (id: number) => {
    if (tempCanvas === null) {
      console.debug("failed to edit, no tempCanvas");
      setCanvasError("tempCanvas is empty");
      return;
    }
    setCurEditingCanvasItem(id);
    // setEditingCanvas(false);
  };
  const saveCanvasItemEdits = (id: number, updates: CanvasItem) => {
    updateCanvasItem(id, updates);
    exitEditCanvasItem();
  };
  const exitEditCanvasItem = () => {
    setCurEditingCanvasItem(null);
    // setEditingCanvas(true);
  };
  const updateCanvasItemImage = async (id: number, base64: string, imageName: string, fileExtension: string) => {
    //upload to supabase
    setUploadingImage(true);
    if (!session) {
      console.debug("not logged in");
      return;
    }
    if (!selectedDate) {
      console.debug("no date selected");
      return;
    }
    // if (!currentPage) {
    //   console.debug("no current page");
    //   return;
    // }
    const filePath = `${session.user.id}/${selectedDate}/${imageName}.${fileExtension}`;
    const { success, data, error } = await StorageService.uploadFile({
      bucket: "book_photos",
      filePath: filePath,
      base64: base64,
      fileExtension: fileExtension,
    });
    if (error) {
      console.debug(error);
      setUploadingImage(false);
      setCanvasError(error);
      return;
    }
    if (!success || !data) {
      console.debug("upload failed");
      setUploadingImage(false);
      setCanvasError("upload failed");
      return;
    }
    const item = tempCanvas?.items.find((item) => item.id === id);
    if (!item || item?.type !== "frame") {
      console.debug("item not found or not a frame");
      return;
    }

    const { data: publicUrl } = StorageService.getPublicUrl("book_photos", data);
    const newSlot = [{ ...item?.slots[0], image: { url: publicUrl ?? "" } }];
    if (item.slots[0].image?.url) {
      StorageService.deleteFile("book_photos", item.slots[0].image.url);
    }
    updateCanvasItem(id, { ...item, slots: newSlot });
    setUploadingImage(false);
    //get url
    //update item
  };
  const addCanvasItem = (item: CanvasItem) => {
    if (!editingCanvas) {
      console.debug("Add failed, Canvas is not in edit mode");
      setCanvasError("Canvas not in edit mode");
      return;
    }
    if (!tempCanvas) {
      console.debug("Add failed, tempCanvas is empty");
      setCanvasError("tempCanvas is empty");
      return;
    }

    // Add the new item to the items array
    const updatedItems = [...tempCanvas.items, item];
    //update items, and add new id
    setTempCanvas({
      ...tempCanvas,
      curId: tempCanvas.curId + 1,
      maxZIndex: tempCanvas.maxZIndex + 1,
      items: updatedItems,
    });
    setCanvasError(null);
  };

  const clearCanvas = () => {
    //probably want to see if its already empty, if so then don't update
    setCanvasHasChanges(true);
    setCanvas(defaultCanvas);
  };
  const startEditCanvas = () => {
    setEditingCanvas(true);
    setTempCanvas(canvas);
  };
  const saveCanvasEdits = async () => {
    //need to figure out/
    if (!editingCanvas) {
      console.debug("Save failed, Canvas is not in edit mode");
      setCanvasError("Canvas not in edit mode");
      return;
    }
    if (currentBook === null) {
      console.debug("Save failed, currentBook is null");
      setCanvasError("currentBook is null");
      return;
    }
    if (!tempCanvas) {
      console.debug("Save failed, tempCanvas is empty");
      setCanvasError("tempCanvas is empty");
      return;
    }
    if (!canvas) {
      console.debug("Save failed, canvas is empty");
      setCanvasError("canvas is empty");
      return;
    }

    setCanvasSaving(true);
    if (!selectedDate) {
      console.debug("no current page");
      setCurrentPageDate(toDayString(new Date()));
    }

    //get json string
    let json = canvasToJson(tempCanvas);
    //update canvas async
    setCanvas(tempCanvas);

    //save to database
    if (!currentPage) {
      console.debug("no current page");
      const curDate = new Date();
      await createPage(selectedDate!, {
        book: books[currentBook].id,
        last_edited: curDate.toISOString(),
        date: selectedDate!,
        canvas: json,
      });
    } else {
      await updatePage(selectedDate!, { ...currentPage, canvas: json });
    }
    if (pagesError) {
      setCanvasError(pagesError);
    }
    let toast = Toast.show("Save complete! :)", {
      duration: 1000,
      position: Toast.positions.CENTER,
    });
    setCanvasHasChanges(false);
    setCanvasSaving(false);
  };
  const exitEditCanvas = () => {
    setEditingCanvas(false);
    setTempCanvas(null);
  };
  const canvasToJson = (canvas: Canvas): Json => {
    return JSON.stringify(canvas);
  };
  const jsonToCanvas = (json: string): Canvas | null => {
    try {
      const canvasObject: Canvas = JSON.parse(json);
      return canvasObject;
    } catch (error) {
      setCanvasError("failed parsing string");
      return null;
    }
  };
  return (
    <CanvasContext.Provider
      value={{
        canvas,
        tempCanvas,
        editingCanvas,
        canvasError,
        canvasSaving,
        canvasLoading,
        curEditingCanvasItem,
        uploadingImage,
        canvasHasChanges,
        setCanvasData,
        editCanvasItem,
        exitEditCanvasItem,
        updateCanvasItem,
        addCanvasItem,
        updateCanvasItemImage,
        removeCanvasItem,
        saveCanvasItemEdits,
        startEditCanvas,
        saveCanvasEdits,
        exitEditCanvas,
        loadCanvasFromJsonString,
        jsonToCanvas,
        canvasToJson,
        clearCanvas,
      }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = (): CanvasContextType => {
  const useCanvas = useContext(CanvasContext);
  if (!useCanvas) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return useCanvas;
};
