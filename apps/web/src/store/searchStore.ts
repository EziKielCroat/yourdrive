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

interface AdvancedFilters {
  location: string;
  modifiedAfter: string | null;
  modifiedBefore: string | null;
  minSize: string | null;
  minSizeUnit: string;
  maxSize: string | null;
  maxSizeUnit: string;
}

export interface SearchFilters {
  query: string;
  fileType: FileTypeFilter;
  person: string | null;
  lastModified: LastModifiedFilter;
  advanced: AdvancedFilters | null;
}

interface SearchState {
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFileType: (fileType: FileTypeFilter) => void;
  setPerson: (person: PersonFilter | null) => void;
  setLastModified: (lastModified: LastModifiedFilter) => void;
  setAdvancedFilters: (filters: Partial<AdvancedFilters>) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultAdvancedFilters: AdvancedFilters = {
  location: "all",
  modifiedAfter: null,
  modifiedBefore: null,
  minSize: null,
  minSizeUnit: "MB",
  maxSize: null,
  maxSizeUnit: "MB",
};

const defaultFilters: SearchFilters = {
  query: "",
  fileType: "all",
  person: null,
  lastModified: "all",
  advanced: null,
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
      filters: { ...state.filters, person: person?.id || null },
    })),

  setLastModified: (lastModified) =>
    set((state) => ({
      filters: { ...state.filters, lastModified },
    })),

  setAdvancedFilters: (advancedFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        advanced: {
          ...(state.filters.advanced || defaultAdvancedFilters),
          ...advancedFilters,
        },
      },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  hasActiveFilters: () => {
    const { filters } = get();
    const hasBasicFilters =
      filters.query !== "" ||
      filters.fileType !== "all" ||
      filters.person !== null ||
      filters.lastModified !== "all";

    const hasAdvancedFilters =
      filters.advanced !== null &&
      (filters.advanced.location !== "all" ||
        filters.advanced.modifiedAfter !== null ||
        filters.advanced.modifiedBefore !== null ||
        filters.advanced.minSize !== null ||
        filters.advanced.maxSize !== null);

    return hasBasicFilters || hasAdvancedFilters;
  },
}));
