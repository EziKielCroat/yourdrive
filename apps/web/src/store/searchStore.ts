import { create } from "zustand";

export type FileTypeFilter =
  | "all"
  | "documents"
  | "images"
  | "videos"
  | "audio"
  | "other";
export type LastModifiedFilter = "all" | "today" | "week" | "month" | "year";

export interface PersonFilter {
  id: string;
  name: string;
  isYou: boolean;
}

export interface SearchFilters {
  query: string;
  fileType: FileTypeFilter;
  person: PersonFilter | null;
  lastModified: LastModifiedFilter;
  // Advanced filters can be added here
  minSize?: number;
  maxSize?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface SearchState {
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFileType: (fileType: FileTypeFilter) => void;
  setPerson: (person: PersonFilter | null) => void;
  setLastModified: (lastModified: LastModifiedFilter) => void;
  setAdvancedFilters: (
    filters: Partial<
      Omit<SearchFilters, "query" | "fileType" | "person" | "lastModified">
    >
  ) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: SearchFilters = {
  query: "",
  fileType: "all",
  person: null,
  lastModified: "all",
};

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: defaultFilters,

  setQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, query },
    })),

  setFileType: (fileType) =>
    set((state) => ({
      filters: { ...state.filters, fileType },
    })),

  setPerson: (person) =>
    set((state) => ({
      filters: { ...state.filters, person },
    })),

  setLastModified: (lastModified) =>
    set((state) => ({
      filters: { ...state.filters, lastModified },
    })),

  setAdvancedFilters: (advancedFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...advancedFilters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  hasActiveFilters: () => {
    const { filters } = get();
    return (
      filters.query !== "" ||
      filters.fileType !== "all" ||
      filters.person !== null ||
      filters.lastModified !== "all" ||
      filters.minSize !== undefined ||
      filters.maxSize !== undefined ||
      filters.dateRange !== undefined
    );
  },
}));
