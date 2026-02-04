import { create } from "zustand";

interface FileActionsStore {
  pendingCount: number;
  isExecuting: boolean;
  markStart: () => void;
  markEnd: () => void;
}

export const useFileActionsStore = create<FileActionsStore>((set) => ({
  pendingCount: 0,
  isExecuting: false,
  markStart: () =>
    set((state) => {
      const newCount = state.pendingCount + 1;
      return {
        pendingCount: newCount,
        isExecuting: newCount > 0,
      };
    }),
  markEnd: () =>
    set((state) => {
      const newCount = Math.max(0, state.pendingCount - 1);
      return {
        pendingCount: newCount,
        isExecuting: newCount > 0,
      };
    }),
}));
