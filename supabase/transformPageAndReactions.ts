// import { supabase } from "@/src/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import { Canvas, ImageType } from "@/src/types/shared.types";
import { Database, Json } from "@/src/types/supabase.types";
import { createClient } from "@supabase/supabase-js";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Page = Database["public"]["Tables"]["pages"]["Row"];
type OldPage = Database["public"]["Tables"]["pages_old"]["Row"];
type PageItem = Database["public"]["Tables"]["page_items"]["Row"];
type TextItem = Database["public"]["Tables"]["text_items"]["Row"];
type ImageItem = Database["public"]["Tables"]["image_items"]["Row"];
type Image = Database["public"]["Tables"]["images"]["Row"];
type Group = Database["public"]["Tables"]["groups"]["Row"];
type GroupMember = Database["public"]["Tables"]["group_members"]["Row"];
type OldReaction = Database["public"]["Tables"]["reactions_old"]["Row"];
type Reaction = Database["public"]["Tables"]["page_reactions"]["Row"];
type ReactionItem = Database["public"]["Tables"]["reaction_items"]["Row"];
type ReactionTextItem = Database["public"]["Tables"]["reaction_text_items"]["Row"];
type Notification = Database["public"]["Tables"]["notifications"]["Row"];
type Font = Database["public"]["Tables"]["fonts"]["Row"];
type Sticker = Database["public"]["Tables"]["stickers"]["Row"];
type Template = Database["public"]["Tables"]["templates"]["Row"];
type Frame = Database["public"]["Tables"]["frames"]["Row"];

const transformPageAndReactions = async () => {
  //   //we want to get all stuff from prod tables into pages_old, and reactions_old
  //   // we need to update the new info to be in a json, and we need to update entries in reactions_old to be a json of 1 entry per page per user, and have an item array
  console.log("test");
  const supabase = createClient<Database>(
    "https://zckngbdtquzqrmrpjhhx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpja25nYmR0cXV6cXJtcnBqaGh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzA3MjgxMiwiZXhwIjoyMDM4NjQ4ODEyfQ.b0dsqsPjWaDFKC3XZrcPP9QIQNmx30Sr4Tzsa0wnQ7M"
  );
  const { data: pagedOld } = await supabase.from("pages_old").select("*");
  const { data: pages } = await supabase.from("pages").select("*");
  const { data: pageItems } = await supabase.from("page_items").select("*");
  const { data: imageItems } = await supabase.from("image_items").select("*");
  const { data: images } = await supabase.from("images").select("*");
  const { data: textItems } = await supabase.from("text_items").select("*");
  const { data: reactionsOld } = await supabase.from("reactions_old").select("*");
  const { data: reactions } = await supabase.from("page_reactions").select("*");
  const { data: reactionItems } = await supabase.from("reaction_items").select("*");
  const { data: reactionTextItems } = await supabase.from("reaction_text_items").select("*");
  //handle old data
  //old pages are fine
  //old reactions
  const old_reaction_page_map = new Map<string, Map<string, string[]>>();
  const old_reaction_data_map = new Map<string, OldReaction>();
  reactionsOld?.forEach((reactionOld) => {
    const old_reaction_map = old_reaction_page_map.get(reactionOld.page_id) || new Map<string, string[]>();
    const user_reactions: string[] = old_reaction_map.get(reactionOld.created_by) || [];
    user_reactions.push(reactionOld.id);
    old_reaction_map.set(reactionOld.created_by, user_reactions);
    old_reaction_page_map.set(reactionOld.page_id, old_reaction_map);
    old_reaction_data_map.set(reactionOld.id, reactionOld.reaction as OldReaction);
  });
  const old_reactions_updated: OldReaction[] = [];
  old_reaction_page_map.forEach((map, page_id) => {
    //want to create the json we'll eventually insert into reactions
    map.forEach((user_reactions, user) => {
      const reaction_items = user_reactions.map((reaction_id) => {
        return old_reaction_data_map.get(reaction_id);
      });
      const updated_reaction: OldReaction = {
        id: uuidv4(),
        page_id: page_id,
        created_by: user,
        reaction: {
          items: reaction_items,
          maxZIndex: reaction_items.length,
        } as Json,
      } as OldReaction;
      old_reactions_updated.push(updated_reaction);
    });
  });
  // create updated reactions
  const reactions_updated: OldReaction[] = [];
  //need to group reactions by user/page
  //data page_id -> map user -> reaction ids
  //reaction-pages
  reactions?.forEach((reaction) => {
    if (reaction.draft || reaction.deleted) {
      return;
    }
    //go through reaction-items, and reaction-text-items to build out the canvas
    //one page-reaction per user
    const reactionItemsData: ReactionItem[] = [];
    const reactionTextItemsData: ReactionTextItem[] = [];
    reactionItems?.forEach((reactionItem: ReactionItem) => {
      if (reactionItem.page_reaction_id === reaction.id) {
        reactionItemsData.push(reactionItem);
      }
    });
    reactionTextItems?.forEach((reactionItem) => {
      if (reactionItemsData.findIndex((item) => item.id === reactionItem.id) !== -1) {
        reactionTextItemsData.push(reactionItem);
      }
    });
    const updatedReactionItems: Json = [];
    reactionItemsData.forEach((reactionItem) => {
      const textReaction = reactionTextItemsData.find((item) => item.id === reactionItem.id);
      if (!textReaction) {
        return;
      }
      const newReaction = {
        id: reactionItem.id,
        type: "text",
        x: reactionItem.x,
        y: reactionItem.y,
        z: reactionItem.z,
        rotation: reactionItem.rotation,
        width: reactionItem.width,
        height: reactionItem.height,
        textContent: textReaction.text,
        fontColor: textReaction.color,
        fontType: textReaction.font,
        fontSize: textReaction.font_size,
      };
      updatedReactionItems.push(newReaction);
    });
    const reactionData: Json = {
      items: updatedReactionItems,
      maxZIndex: Math.max(updatedReactionItems.map((item: ReactionItem) => item.z)),
    };
    const updated_reaction: OldReaction = {
      id: reaction.id,
      page_id: reaction.page_id,
      created_by: reaction.created_by,
      reaction: reactionData,
    } as OldReaction;
    reactions_updated.push(updated_reaction);
  });
  //process info for pages
  const pages_updated: OldPage[] = [];
  const page_map = new Map<string, Page>();
  pages?.forEach((page) => {
    page_map.set(page.id, page);
  });
  const page_item_map = new Map<string, PageItem>();
  pageItems?.forEach((pageItem) => {
    page_item_map.set(pageItem.id, pageItem);
  });
  const text_item_map = new Map<string, TextItem>();
  textItems?.forEach((textItem) => {
    text_item_map.set(textItem.id, textItem);
  });
  const image_item_map = new Map<string, ImageItem>();
  imageItems?.forEach((imageItem) => {
    image_item_map.set(imageItem.id, imageItem);
  });
  const image_map = new Map<string, Image>();
  images?.forEach((image) => {
    image_map.set(image.id, image);
  });
  //build updated pages
  pages?.forEach((page) => {
    if (page.draft || page.deleted) {
      return;
    }
    const canvas: Canvas = {
      id: uuidv4(),
      items: [],
      maxZIndex: 0,
      screenWidth: page.screen_width,
      screenHeight: page.screen_height,
      backgroundImage: {
        //need to update all old entries to have type: "local", instead of "Local"
        type: ImageType.Local,
        path: page.background_image || "",
      },
    };
    //add all the items to the canvas
    pageItems?.forEach((pageItem) => {
      if (pageItem.page_id === page.id && pageItem.deleted === false) {
        const item = page_item_map.get(pageItem.id);
        if (!item) return;
        if (item.type === "image") {
          const imageItem = image_item_map.get(item.id);
          if (!imageItem) return;
          const image = image_map.get(imageItem.image_id);
          if (!image) return;
          canvas.items.push({
            id: item.id,
            type: item.type,
            x: item.x,
            y: item.y,
            z: item.z,
            rotation: item.rotation,
            width: item.width,
            height: item.height,
            placeholder: image.placeholder || "",
            path: image.path,
          });
        } else if (item.type === "text") {
          const text = text_item_map.get(item.id);
          if (!text) return;
          canvas.items.push({
            id: item.id,
            type: item.type,
            x: item.x,
            y: item.y,
            z: item.z,
            rotation: item.rotation,
            width: item.width,
            height: item.height,
            textContent: text.text,
            fontSize: text.font_size || 0,
            fontColor: text.color,
            fontType: text.font,
          });
        }
      }
    });
    const updated_page = {
      id: page.id,
      created_by: page.created_by,
      date: page.date,
      created_at: page.created_at,
      updated_at: page.updated_at,
      group_id: page.group_id,
      canvas: canvas as Json,
    } as OldPage;
    pages_updated.push(updated_page);
  });

  // print out new info before updating
  // console.log("pages_updated", pages_updated);
  //   console.log("reactions_updated", old_reactions_updated);
  //   console.log("new_reactions_updated", reactions_updated);
  // update tables with new info
  //   fs.writeFileSync("pages_updated.txt", JSON.stringify(pages_updated), { encoding: "utf8" });
  //   fs.writeFileSync("old_reactions_updated.txt", JSON.stringify(old_reactions_updated), { encoding: "utf8" });
  //   fs.writeFileSync("reactions_updated.txt", JSON.stringify(reactions_updated), { encoding: "utf8" });
  //update db's
  //   const { error: pagesError } = await supabase.from("pages_old").insert(pages_updated);
  //   if (pagesError) {
  //     console.log("pagesError", pagesError);
  //   }

  const { error: oldReactionsError } = await supabase.from("reactions_old").delete();
  if (oldReactionsError) {
    console.log("oldReactionsError", oldReactionsError);
  }
  const { error: reactionsError } = await supabase
    .from("reactions_old")
    .insert([...reactions_updated, ...old_reactions_updated]);
  if (reactionsError) {
    console.log("reactionsError", reactionsError);
  }
};

console.log("running transformPageAndReactions");
transformPageAndReactions();
