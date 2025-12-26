import { useMemo } from "react";
import { type FileItem } from "../files_table/FilesTable";
import { useSearchStore, type SearchFilters } from "../../../store/searchStore";

// MIME type categories
const MIME_TYPE_CATEGORIES = {
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],
  images: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  videos: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
};

function getFileCategory(mimeType: string): string {
  for (const [category, types] of Object.entries(MIME_TYPE_CATEGORIES)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  return "other";
}

function matchesFileType(file: FileItem, fileTypeFilter: string): boolean {
  if (fileTypeFilter === "all") return true;

  const category = getFileCategory(file.mimeType || "");
  return category === fileTypeFilter;
}

function matchesPerson(
  file: FileItem,
  personFilter: SearchFilters["person"]
): boolean {
  if (!personFilter) return true;

  // Match by owner ID or name
  return (
    file.owner.name === personFilter.name ||
    (personFilter.isYou && file.owner.isYou)
  );
}

function matchesLastModified(
  file: FileItem,
  lastModifiedFilter: string
): boolean {
  if (lastModifiedFilter === "all") return true;

  // Parse the lastInteraction string (e.g., "Today", "Yesterday", "3 days ago", "24/12/2024")
  const now = new Date();
  const interaction = file.lastInteraction.toLowerCase();

  if (lastModifiedFilter === "today") {
    return interaction === "today";
  }

  if (lastModifiedFilter === "week") {
    if (interaction === "today" || interaction === "yesterday") return true;

    const daysMatch = interaction.match(/(\d+)\s+days?\s+ago/);
    if (daysMatch) {
      return parseInt(daysMatch[1]) <= 7;
    }

    // Check date format
    const dateParts = file.lastInteraction.match(
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );
    if (dateParts) {
      const [, day, month, year] = dateParts;
      const fileDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      const diffTime = now.getTime() - fileDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    return false;
  }

  if (lastModifiedFilter === "month") {
    if (interaction === "today" || interaction === "yesterday") return true;

    const daysMatch = interaction.match(/(\d+)\s+days?\s+ago/);
    if (daysMatch) {
      return parseInt(daysMatch[1]) <= 30;
    }

    const dateParts = file.lastInteraction.match(
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );
    if (dateParts) {
      const [, day, month, year] = dateParts;
      const fileDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      const diffTime = now.getTime() - fileDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }

    return false;
  }

  if (lastModifiedFilter === "year") {
    // Everything within a year
    const dateParts = file.lastInteraction.match(
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );
    if (dateParts) {
      const [, day, month, year] = dateParts;
      const fileDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      const diffTime = now.getTime() - fileDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 365;
    }

    // If it's in "X days ago" format, it's definitely within a year
    return true;
  }

  return true;
}

function matchesQuery(file: FileItem, query: string): boolean {
  if (!query) return true;

  const searchTerm = query.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Search in file name
  if (fileName.includes(searchTerm)) return true;

  // Search in location
  if (file.location && file.location.toLowerCase().includes(searchTerm))
    return true;

  // Could extend to search in tags, descriptions, etc.

  return false;
}

function matchesAdvancedFilters(
  file: FileItem,
  filters: SearchFilters
): boolean {
  // Size filters
  if (filters.minSize !== undefined && file.size < filters.minSize) {
    return false;
  }

  if (filters.maxSize !== undefined && file.size > filters.maxSize) {
    return false;
  }

  // Date range filter (if you add createdAt or modifiedAt to FileItem)
  // if (filters.dateRange) {
  //   const fileDate = new Date(file.createdAt);
  //   if (fileDate < filters.dateRange.start || fileDate > filters.dateRange.end) {
  //     return false;
  //   }
  // }

  return true;
}

export function useFileSearch(files: FileItem[]) {
  const filters = useSearchStore((s) => s.filters);
  const hasActiveFilters = useSearchStore((s) => s.hasActiveFilters);

  const filteredFiles = useMemo(() => {
    if (!hasActiveFilters()) {
      return files;
    }

    return files.filter((file) => {
      // Apply all filters
      return (
        matchesQuery(file, filters.query) &&
        matchesFileType(file, filters.fileType) &&
        matchesPerson(file, filters.person) &&
        matchesLastModified(file, filters.lastModified) &&
        matchesAdvancedFilters(file, filters)
      );
    });
  }, [files, filters, hasActiveFilters]);

  return {
    filteredFiles,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: [
      filters.query !== "",
      filters.fileType !== "all",
      filters.person !== null,
      filters.lastModified !== "all",
      filters.minSize !== undefined,
      filters.maxSize !== undefined,
      filters.dateRange !== undefined,
    ].filter(Boolean).length,
  };
}
