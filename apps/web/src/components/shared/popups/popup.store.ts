import { create } from "zustand";

interface PopupState {
  isUploadPopupOpen: boolean;
  isFileTypePopupOpen: boolean;
  isPersonPopupOpen: boolean;
  isLastModifiedPopupOpen: boolean;
  isAdvancedPopupOpen: boolean;

  toggleUploadPopup: () => void;
  closeUploadPopup: () => void;
  toggleFileTypePopup: () => void;
  closeFileTypePopup: () => void;
  togglePersonPopup: () => void;
  closePersonPopup: () => void;
  toggleLastModifiedPopup: () => void;
  closeLastModifiedPopup: () => void;
  toggleAdvancedPopup: () => void;
  closeAdvancedPopup: () => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  isUploadPopupOpen: false,
  isFileTypePopupOpen: false,
  isPersonPopupOpen: false,
  isLastModifiedPopupOpen: false,
  isAdvancedPopupOpen: false,

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

  toggleFileTypePopup: () =>
    set((state) => ({
      isFileTypePopupOpen: !state.isFileTypePopupOpen,
    })),
  closeFileTypePopup: () =>
    set(() => ({
      isFileTypePopupOpen: false,
    })),

  togglePersonPopup: () =>
    set((state) => ({
      isPersonPopupOpen: !state.isPersonPopupOpen,
    })),
  closePersonPopup: () =>
    set(() => ({
      isPersonPopupOpen: false,
    })),

  toggleLastModifiedPopup: () =>
    set((state) => ({
      isLastModifiedPopupOpen: !state.isLastModifiedPopupOpen,
    })),
  closeLastModifiedPopup: () =>
    set(() => ({
      isLastModifiedPopupOpen: false,
    })),

  toggleAdvancedPopup: () =>
    set((state) => ({
      isAdvancedPopupOpen: !state.isAdvancedPopupOpen,
    })),
  closeAdvancedPopup: () =>
    set(() => ({
      isAdvancedPopupOpen: false,
    })),
}));
