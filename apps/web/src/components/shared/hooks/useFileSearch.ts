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

function matchesPerson(file: FileItem, personFilter: string | null): boolean {
  if (!personFilter) return true;

  if (personFilter === "me") {
    return file.owner.isYou === true;
  }

  return file.owner.name === personFilter;
}

function matchesLastModified(
  file: FileItem,
  lastModifiedFilter: string
): boolean {
  if (lastModifiedFilter === "all") return true;

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
  if (!filters.advanced) {
    return true;
  }

  const advanced = filters.advanced;

  if (advanced.location !== "all") {
    switch (advanced.location) {
      case "my-files":
        if (!file.owner.isYou) return false;
        break;
      case "shared-with-me":
        if (file.owner.isYou) return false;
        break;
      case "starred":
        // Assuming im going to add a `starred` property to FileItem
        if (!(file as any).starred) return false;
        break;
      case "trash":
        // Assuming im going to add a `trashed` property to FileItem
        if (!(file as any).trashed) return false;
        break;
      case "specific-folder":
        // TODO need to implement folder matching logic
        // For now, this is a placeholder
        break;
    }
  }

  if (advanced.modifiedAfter) {
    const afterDate = new Date(advanced.modifiedAfter);
    const fileDate = new Date(file.lastInteraction);
    if (fileDate < afterDate) {
      return false;
    }
  }

  if (advanced.modifiedBefore) {
    const beforeDate = new Date(advanced.modifiedBefore);
    const fileDate = new Date(file.lastInteraction);
    if (fileDate > beforeDate) {
      return false;
    }
  }

  const fileSizeInBytes = file.size || 0;

  if (advanced.minSize) {
    const minSizeInBytes = convertToBytes(
      parseFloat(advanced.minSize),
      advanced.minSizeUnit
    );
    if (fileSizeInBytes < minSizeInBytes) {
      return false;
    }
  }

  if (advanced.maxSize) {
    const maxSizeInBytes = convertToBytes(
      parseFloat(advanced.maxSize),
      advanced.maxSizeUnit
    );
    if (fileSizeInBytes > maxSizeInBytes) {
      return false;
    }
  }

  return true;
}

function convertToBytes(size: number, unit: string): number {
  switch (unit) {
    case "KB":
      return size * 1024;
    case "MB":
      return size * 1024 * 1024;
    case "GB":
      return size * 1024 * 1024 * 1024;
    default:
      return size;
  }
}

export function useFileSearch(files: FileItem[]) {
  const filters = useSearchStore((s) => s.filters);
  const hasActiveFilters = useSearchStore((s) => s.hasActiveFilters);

  const filteredFiles = useMemo(() => {
    if (!hasActiveFilters()) {
      return files;
    }

    return files.filter((file) => {
      return (
        matchesQuery(file, filters.query) &&
        matchesFileType(file, filters.fileType) &&
        matchesPerson(file, filters.person) &&
        matchesLastModified(file, filters.lastModified) &&
        matchesAdvancedFilters(file, filters)
      );
    });
  }, [files, filters, hasActiveFilters]);

  const calculateActiveFilterCount = () => {
    let count = 0;

    if (filters.query !== "") count++;
    if (filters.fileType !== "all") count++;
    if (filters.person !== null) count++;
    if (filters.lastModified !== "all") count++;

    if (filters.advanced) {
      if (filters.advanced.location !== "all") count++;
      if (filters.advanced.modifiedAfter !== null) count++;
      if (filters.advanced.modifiedBefore !== null) count++;
      if (filters.advanced.minSize !== null) count++;
      if (filters.advanced.maxSize !== null) count++;
    }

    return count;
  };

  return {
    filteredFiles,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: calculateActiveFilterCount(),
  };
}
