import { observable } from "@legendapp/state";
interface ImageEditStore {
  selectedImage: string | null;
}
export const imageEditStore$ = observable<ImageEditStore>({
  selectedImage: null,
});
