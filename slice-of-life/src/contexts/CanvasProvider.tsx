import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Canvas, CanvasItem, Page } from "../types/shared.types";
import { useData } from "./DataProvider";
import { Json } from "../types/supabase.types";

interface CanvasContextType {
  canvas: Canvas;
  tempCanvas: Canvas | null;
  editing: boolean;
  canvasError: string | null;
  canvasSaving: boolean;
  setCanvasData: (canvas: Canvas) => void;
  updateCanvasItem: (oldItem: CanvasItem, newItem: CanvasItem) => void;
  addCanvasItem: (item: CanvasItem) => void;
  removeCanvasItem: (item: CanvasItem) => void;
  startEdit: () => void;
  saveCanvas: () => void;
  clearCanvas: () => void;
  exitEdit: () => void;
  loadCanvasFromJsonString: (json: string) => void;
  jsonToCanvas: (json: string) => Canvas | null;
  canvasToJson: (canvas: Canvas) => Json;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const defaultCanvas = {
    backgroundImagePath: "bg_04",
    items: [],
  };
  const { pagesMap, pagesLoading, selectedDate, updatePage, pagesError } = useData();
  // maybe get current page from book/page provider after we seperate them out
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [canvas, setCanvas] = useState<Canvas>(defaultCanvas);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  const [canvasLoading, setCanvasLoading] = useState<boolean>(true);
  const [canvasSaving, setCanvasSaving] = useState<boolean>(false);
  const [tempCanvas, setTempCanvas] = useState<Canvas | null>(null);
  const [editing, setEditing] = useState<boolean>(false);

  useEffect(() => {
    console.log("updating canvas from pages", pagesMap, "date", selectedDate);
    if (pagesLoading === false && pagesMap && selectedDate) {
      const curPage = pagesMap.get(selectedDate);
      if (curPage) {
        setCurrentPage(curPage);
        loadCanvasFromJsonString(JSON.stringify(curPage.canvas));
      } else {
        setCurrentPage(null);
        setCanvas(defaultCanvas);
      }
      setCanvasLoading(false);
    }
  }, [pagesMap, selectedDate, pagesLoading]);

  const loadCanvasFromJsonString = (json: string) => {
    if (!json) {
      setCanvasError("json is empty");
      return;
    }
    const newCanvas = jsonToCanvas(json);
    if (!newCanvas) {
      setCanvasError("failed parsing json");
      return;
    }
    setCanvas(newCanvas);
  };
  const setCanvasData = (canvas: Canvas) => {
    setCanvas(canvas);
  };
  const updateCanvasItem = (oldItem: CanvasItem, newItem: CanvasItem) => {
    if (!canvas) {
      setCanvasError("Canvas is empty");
      return;
    }
    if (!editing) {
      setCanvasError("Canvas not in edit mode");
      return;
    }

    const updatedItems = canvas.items.map((item) => (item.id === oldItem.id ? newItem : item));

    setCanvas({ ...canvas, items: updatedItems });
    setCanvasError(null);
  };

  const removeCanvasItem = (item: CanvasItem) => {
    if (!canvas) {
      setCanvasError("Canvas is empty");
      return;
    }
    if (!editing) {
      setCanvasError("Canvas not in edit mode");
      return;
    }

    const updatedItems = canvas.items.filter((canvasItem) => canvasItem.id !== item.id);

    setCanvas({ ...canvas, items: updatedItems });
    setCanvasError(null);
  };

  const addCanvasItem = (item: CanvasItem) => {
    if (!canvas) {
      setCanvasError("Canvas is empty");
      return;
    }
    if (!editing) {
      setCanvasError("Canvas not in edit mode");
      return;
    }

    const updatedItems = [...canvas.items, item];

    setCanvas({ ...canvas, items: updatedItems });
    setCanvasError(null);
  };

  const clearCanvas = () => {
    setCanvas(defaultCanvas);
  };
  const startEdit = () => {
    setEditing(true);
    setTempCanvas(canvas);
  };
  const saveCanvas = async () => {
    //need to figure out/
    if (!currentPage || !selectedDate) {
      setCanvasError("no current page");
      return;
    }
    setCanvasSaving(true);
    if (tempCanvas) {
      setCanvas(tempCanvas);
    }
    if (!canvas) {
      setCanvasError("canvas is empty");
      return;
    }
    let json = canvasToJson(canvas);
    //save to database
    await updatePage(selectedDate, { ...currentPage, canvas: json });
    if (pagesError) {
      setCanvasError(pagesError);
    }
    setCanvasSaving(false);
  };
  const exitEdit = () => {
    setEditing(false);
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
        editing,
        canvasError,
        canvasSaving,
        setCanvasData,
        updateCanvasItem,
        addCanvasItem,
        removeCanvasItem,
        startEdit,
        saveCanvas,
        exitEdit,
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
