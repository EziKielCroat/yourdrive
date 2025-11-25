import { create } from "zustand";

interface PopupState {
  isUploadPopupOpen: boolean;

  toggleUploadPopup: () => void;
  closeUploadPopup: () => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  isUploadPopupOpen: false,

  toggleUploadPopup: () =>
    set((state) => {
      console.log("Opening upload popup");
      return { isUploadPopupOpen: !state.isUploadPopupOpen };
    }),
  closeUploadPopup: () =>
    set(() => {
      console.log("Closing upload popup");
      return { isUploadPopupOpen: false };
    }),
}));
