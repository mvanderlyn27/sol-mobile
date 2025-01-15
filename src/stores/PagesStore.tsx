import { observable, syncState } from "@legendapp/state";
import { Canvas, GroupMember, Page, Image, Json } from "../types/shared.types";
import { supabase } from "../lib/supabase";
import { customSupabaseSynced, generateId } from "./AsyncStorage";

import { posthog } from "../services/Posthog";
import { WaitForSetCrudFnParams } from "@legendapp/state/sync-plugins/crud";
import { groupStore$ } from "./GroupStore";

interface PageStore {
  members: GroupMember[];
  dates: DateItem[];
  startDate: string | null;
  endDate: string | null;
  curRow: number;
  curCol: number;
  curPageId: string | null;
  editMode: boolean;
  loadedPages: number;
  saving: boolean;
  loading: boolean;
  ready: boolean;
}
export interface DateItem {
  id: string;
  date: string;
}
export interface PageMap {
  id: string;
  pages: Map<string, Canvas>;
}
// Constants

// Observable store for PageStore
export const pageStore$ = observable<PageStore>({
  members: [],
  dates: [],
  startDate: null,
  endDate: null,
  curRow: 0,
  curCol: 0,
  curPageId: null,
  editMode: false,
  loadedPages: 0,
  saving: false,
  loading: false,
  ready: false,
});

// const canvas = {
//   id: "a7590e12-4650-41b6-9120-db2549491781",
//   items: [
//     {
//       x: 0.05466666666666667,
//       y: 0.3657635280064175,
//       z: 10,
//       id: "3091368f-c36a-4149-8982-f7c83933fb93",
//       type: "text",
//       width: 0,
//       height: 0,
//       fontSize: 0.01600985221674877,
//       fontType: "Calibri",
//       rotation: 0,
//       fontColor: "#000",
//       textContent:
//         "感覺整個人被打回初階\n大概能理解文章想說的\n但完全無法化成文字闡述\n申論好難整個人要爆炸🤯\n而且還有英文要讀😓😥😰\n今天也被朋友說我輸入跟輸出的程度差太多\n沒辦法 如果嘴巴跟得上課本該有多好",
//     },
//     {
//       x: 0.432,
//       y: 0.5564450043175603,
//       z: 13,
//       id: "bed033f0-4602-4481-9811-2add271557aa",
//       path: "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/page_photos/a25e0568-6a10-4582-9562-2c78fc211089/1680b785-3c04-4029-9533-0c90a992ff50.webp",
//       type: "image",
//       width: 0.555403644303584,
//       height: 0.3207007816401367,
//       rotation: -0.031760807986412,
//       placeholder: "LqN^JHo0_NozxuR*ays:ofkBayjG",
//     },
//     {
//       x: -0.013333333333333334,
//       y: 0.09852216748768473,
//       z: 3,
//       id: "f04d2dad-dd14-4957-80c8-b58987a7817b",
//       path: "https://zckngbdtquzqrmrpjhhx.supabase.co/storage/v1/object/public/page_photos/a25e0568-6a10-4582-9562-2c78fc211089/fcd4f131-da75-4413-9eb7-9848f888f010.webp",
//       type: "image",
//       width: 1,
//       height: 0.2597752463054187,
//       rotation: 0,
//       placeholder: "LTK1BjtnD$9G%%tRROE2n~s*RjtR",
//     },
//   ],
//   maxZIndex: 0,
//   backgroundImage: { path: "bg_04", type: "local" },
// };

// export const pages$ = observable<
//   Record<
//     string,
//     {
//       canvas: Json | null;
//       created_at: string;
//       created_by: string;
//       date: string;
//       deleted: boolean;
//       group_id: string;
//       id: string;
//       updated_at: string;
//     }
//   >
// >({});

// const generatePages = (createdByArray: string[], datesArray: string[], group_id: string) => {
//   createdByArray.forEach((created_by) => {
//     datesArray.forEach((date) => {
//       const pageId = generateId();
//       const val = {
//         id: pageId,
//         created_at: new Date().toISOString(),
//         date,
//         updated_at: new Date().toISOString(),
//         deleted: false,
//         group_id: group_id,
//         created_by,
//         canvas: canvas,
//       };
//       pages$[pageId].set(val);
//     });
//   });
// };

// // Example usage:
// const createdByArray = [
//   "6eea90f5-325a-4ccf-aceb-3471c02914c0",
//   "eecd2083-81ee-4e52-a4cf-fd6687bd002d",
//   "632e3d17-8713-46e9-ab1b-604bfa3ce11f",
//   "a6300bac-4d56-49f3-9e9e-a3919a9bd8cf",
//   "2bdbc127-920a-432e-b1b6-1fa1ed6687a1",
//   "753bc1ca-d8e5-4830-b226-2632c18f91df",
// ];
// const datesArray = ["2025-01-12", "2025-01-11", "2025-01-10", "2025-01-09", "2025-01-08", "2025-01-07"];
// const groupId = "4b381455-be80-45e1-96e9-03ea15450ad8";

// generatePages(createdByArray, datesArray, groupId);
export const pages$ = observable(
  customSupabaseSynced({
    supabase,
    collection: "pages",
    // realtime: true,
    // persist: {
    //   name: `pages-${process.env.APP_VARIANT}`,
    //   retrySync: true, // Persist pending changes and retry
    // },
    retry: {
      infinite: true, // Retry changes with exponential backoff
    },

    // select: (from) => {
    //   const selectedGroup = groupStore$.selectedGroup.get();
    //   if (!selectedGroup) {
    //     return from.select().limit(0);
    //   }

    //   const dates = pageStore$.dates.get();
    //   if (!dates || !dates.length) {
    //     console.log("no date selected");
    //     return from.select().limit(0);
    //   }
    //   return from
    //     .select("*")
    //     .eq("group_id", selectedGroup)
    //     .lte("date", dates[0].date)
    //     .gte("date", dates[dates.length - 1].date);
    // },
    // waitFor: [groupStore$.selectedGroup.get(), pageStore$.dates.get()],
    onError: (error) => {
      console.log("pages error", error);
    },
  })
);

interface CanvasStore {
  canvas: Canvas | null;
}
export const canvasStore$ = observable<CanvasStore>({
  canvas: null,
});
