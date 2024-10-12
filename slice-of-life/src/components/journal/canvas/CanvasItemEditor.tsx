import { useCanvas } from "@/src/contexts/CanvasProvider";
import EditCanvasText from "./EditCanvasText";
import EditCanvasFrame from "./EditCanvasFrame";

export default function CanvasItemEditor() {
  const { tempCanvas, curEditingCanvasItem } = useCanvas();
  if (!tempCanvas || !curEditingCanvasItem) {
    console.log("no tempCanvas or curEditingCanvasItem", tempCanvas, curEditingCanvasItem);
    return null;
  }
  const curItem = tempCanvas.items.find((item) => item.id === curEditingCanvasItem);
  if (!curItem) {
    console.log("no curItem", curItem);
    return null;
  }
  console.log("rendering editor");
  switch (curItem.type) {
    case "text":
      return <EditCanvasText item={curItem} />;
    case "frame":
      return <EditCanvasFrame item={curItem} />;
    default:
      return null;
  }
}
