import { CanvasItem, CanvasReactionItem, Json } from "@/src/types/shared.types";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { parse } from "json2csv";

function jsonToCsv(jsonArray: Json[]) {
  const headers = Object.keys(jsonArray[0]);
  const rows = jsonArray.map((obj) => headers.map((header) => JSON.stringify(obj[header])).join(","));

  return [headers.join(","), ...rows].join("\n");
}
const transformPageAndReactions = async () => {
  console.log("Starting data transformation...");

  // Initialize Supabase client
  const supabase = createClient(
    "https://zckngbdtquzqrmrpjhhx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpja25nYmR0cXV6cXJtcnBqaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwNzI4MTIsImV4cCI6MjAzODY0ODgxMn0.702aEOGOQQaBJ7gieS5lzy8JSunpsyTh-V6GUkb_tu4"
    // "https://nxbcgeaxusuukirkvrbt.supabase.co",
    // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54YmNnZWF4dXN1dWtpcmt2cmJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyMjY4OTIsImV4cCI6MjA0NDgwMjg5Mn0.2GpnMfqYePObcCoCEJCwe78otQKeV1piyGVWWDerQmc"
  );

  // Fetch pages and reactions data
  const { data: pages, error: pagesError } = await supabase.from("pages").select("*");
  const { data: reactions, error: reactionsError } = await supabase.from("reactions").select("*");

  if (pagesError || reactionsError) {
    console.error("Error fetching data:", pagesError || reactionsError);
    return;
  }

  const transformedPages = pages.map((page) => {
    console.log("page", page);
    if (!page?.canvas) return page;
    const { screenWidth, screenHeight, items } = page.canvas;

    const updatedItems = items.map((item: CanvasItem) => {
      switch (item.type) {
        case "image":
          return {
            ...item,
            x: item.x / screenWidth,
            y: item.y / screenHeight,
            width: item.width / screenWidth,
            height: item.height / screenHeight,
          };
        case "text":
          return {
            ...item,
            x: item.x / screenWidth,
            y: item.y / screenHeight,
            fontSize: item.fontSize / screenHeight,
            width: item.width / screenWidth,
            height: item.height / screenHeight,
          };
      }
    });
    return {
      ...page,
      canvas: { ...page.canvas, items: updatedItems, screenWidth: undefined, screenHeight: undefined },
    };
  });

  const transformedReactions = reactions.map((reactionFull) => {
    const reaction = reactionFull.reaction;
    const page = pages.find((p) => p.id === reactionFull.page_id);
    if (!page || !page.canvas) return reactionFull;

    const { screenWidth, screenHeight } = page.canvas;

    const reactionItems = reaction.items.map((item: CanvasReactionItem) => ({
      ...item,
      x: item.x / screenWidth,
      y: item.y / screenHeight,
      fontSize: item.fontSize / screenHeight,
    }));

    return {
      ...reactionFull,
      reaction: {
        items: reactionItems,
        screenHeight: undefined,
        screenWidth: undefined,
      },
    };
  });

  // Remove screenWidth and screenHeight from the original page canvas
  // transformedPages.forEach((page) => {
  //   const canvas = page.canvas;
  //   delete canvas.screenWidth;
  //   delete canvas.screenHeight;
  //   // page.canvas = JSON.stringify(canvas);
  // });
  // transformedPages.forEach((reactionObj) => {
  //   const reaction = reactionObj.reaction;
  //   console.log(reaction, reactionObj);
  //   delete reaction.screenWidth;
  //   delete reaction.screenHeight;
  //   // reactionObj.reaction = JSON.stringify(reaction);
  // });

  // Export transformed data to CSV
  console.log("final pages", transformedPages);
  console.log("final reactions", transformedReactions);
  try {
    // const pagesCsv = jsonToCsv(transformedPages);
    const pagesCsv = parse(transformedPages);
    // const reactionsCsv = jsonToCsv(transformedReactions);
    const reactionsCsv = parse(transformedReactions);

    writeFileSync("transformed_pages.csv", pagesCsv);
    writeFileSync("transformed_reactions.csv", reactionsCsv);

    console.log("Data transformation complete. CSV files generated.");
  } catch (err) {
    console.error("Error generating CSV:", err);
  }
};

console.log("Running transformPageAndReactions...");
transformPageAndReactions();
