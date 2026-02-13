export interface FileTypeInfo {
  type:
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "document"
    | "text"
    | "code"
    | "archive"
    | "unsupported";
  extension: string;
  mimeType?: string;
  isPreviewable: boolean;
  previewCategory:
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "text"
    | "code"
    | "document"
    | "office"
    | "archive"
    | "default";
  canDownload: boolean;
}

export const FILE_TYPE_MAP = {
  // PDF
  pdf: {
    type: "pdf",
    mimeType: "application/pdf",
    previewCategory: "pdf" as const,
  },

  // Images
  jpg: {
    type: "image",
    mimeType: "image/jpeg",
    previewCategory: "image" as const,
  },
  jpeg: {
    type: "image",
    mimeType: "image/jpeg",
    previewCategory: "image" as const,
  },
  png: {
    type: "image",
    mimeType: "image/png",
    previewCategory: "image" as const,
  },
  gif: {
    type: "image",
    mimeType: "image/gif",
    previewCategory: "image" as const,
  },
  webp: {
    type: "image",
    mimeType: "image/webp",
    previewCategory: "image" as const,
  },
  svg: {
    type: "image",
    mimeType: "image/svg+xml",
    previewCategory: "image" as const,
  },
  bmp: {
    type: "image",
    mimeType: "image/bmp",
    previewCategory: "image" as const,
  },
  tiff: {
    type: "image",
    mimeType: "image/tiff",
    previewCategory: "image" as const,
  },
  tif: {
    type: "image",
    mimeType: "image/tiff",
    previewCategory: "image" as const,
  },
  ico: {
    type: "image",
    mimeType: "image/x-icon",
    previewCategory: "image" as const,
  },

  // Videos
  mp4: {
    type: "video",
    mimeType: "video/mp4",
    previewCategory: "video" as const,
  },
  webm: {
    type: "video",
    mimeType: "video/webm",
    previewCategory: "video" as const,
  },
  mov: {
    type: "video",
    mimeType: "video/quicktime",
    previewCategory: "video" as const,
  },
  m4v: {
    type: "video",
    mimeType: "video/x-m4v",
    previewCategory: "video" as const,
  },
  avi: {
    type: "video",
    mimeType: "video/x-msvideo",
    previewCategory: "video" as const,
  },
  wmv: {
    type: "video",
    mimeType: "video/x-ms-wmv",
    previewCategory: "video" as const,
  },
  flv: {
    type: "video",
    mimeType: "video/x-flv",
    previewCategory: "video" as const,
  },
  mkv: {
    type: "video",
    mimeType: "video/x-matroska",
    previewCategory: "video" as const,
  },

  // Audio
  mp3: {
    type: "audio",
    mimeType: "audio/mpeg",
    previewCategory: "audio" as const,
  },
  wav: {
    type: "audio",
    mimeType: "audio/wav",
    previewCategory: "audio" as const,
  },
  ogg: {
    type: "audio",
    mimeType: "audio/ogg",
    previewCategory: "audio" as const,
  },
  flac: {
    type: "audio",
    mimeType: "audio/flac",
    previewCategory: "audio" as const,
  },
  aac: {
    type: "audio",
    mimeType: "audio/aac",
    previewCategory: "audio" as const,
  },
  m4a: {
    type: "audio",
    mimeType: "audio/mp4",
    previewCategory: "audio" as const,
  },
  opus: {
    type: "audio",
    mimeType: "audio/opus",
    previewCategory: "audio" as const,
  },
  oga: {
    type: "audio",
    mimeType: "audio/ogg",
    previewCategory: "audio" as const,
  },

  // Spreadsheets
  xls: {
    type: "spreadsheet",
    mimeType: "application/vnd.ms-excel",
    previewCategory: "spreadsheet" as const,
  },
  xlsx: {
    type: "spreadsheet",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    previewCategory: "spreadsheet" as const,
  },
  xlsm: {
    type: "spreadsheet",
    mimeType: "application/vnd.ms-excel.sheet.macroEnabled.12",
    previewCategory: "spreadsheet" as const,
  },
  csv: {
    type: "spreadsheet",
    mimeType: "text/csv",
    previewCategory: "spreadsheet" as const,
  },
  tsv: {
    type: "spreadsheet",
    mimeType: "text/tab-separated-values",
    previewCategory: "spreadsheet" as const,
  },
  ods: {
    type: "spreadsheet",
    mimeType: "application/vnd.oasis.opendocument.spreadsheet",
    previewCategory: "spreadsheet" as const,
  },

  // Documents
  doc: {
    type: "document",
    mimeType: "application/msword",
    previewCategory: "office" as const,
  },
  docx: {
    type: "document",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    previewCategory: "office" as const,
  },
  odt: {
    type: "document",
    mimeType: "application/vnd.oasis.opendocument.text",
    previewCategory: "document" as const,
  },
  rtf: {
    type: "document",
    mimeType: "application/rtf",
    previewCategory: "document" as const,
  },

  // Text/Code files
  txt: {
    type: "text",
    mimeType: "text/plain",
    previewCategory: "text" as const,
  },
  md: {
    type: "text",
    mimeType: "text/markdown",
    previewCategory: "text" as const,
  },
  json: {
    type: "code",
    mimeType: "application/json",
    previewCategory: "code" as const,
  },
  xml: {
    type: "code",
    mimeType: "application/xml",
    previewCategory: "code" as const,
  },
  yaml: {
    type: "code",
    mimeType: "application/x-yaml",
    previewCategory: "code" as const,
  },
  yml: {
    type: "code",
    mimeType: "application/x-yaml",
    previewCategory: "code" as const,
  },
  js: {
    type: "code",
    mimeType: "application/javascript",
    previewCategory: "code" as const,
  },
  jsx: {
    type: "code",
    mimeType: "application/javascript",
    previewCategory: "code" as const,
  },
  ts: {
    type: "code",
    mimeType: "application/typescript",
    previewCategory: "code" as const,
  },
  tsx: {
    type: "code",
    mimeType: "application/typescript",
    previewCategory: "code" as const,
  },
  py: {
    type: "code",
    mimeType: "text/x-python",
    previewCategory: "code" as const,
  },
  java: {
    type: "code",
    mimeType: "text/x-java",
    previewCategory: "code" as const,
  },
  html: {
    type: "code",
    mimeType: "text/html",
    previewCategory: "code" as const,
  },
  css: { type: "code", mimeType: "text/css", previewCategory: "code" as const },
  scss: {
    type: "code",
    mimeType: "text/x-scss",
    previewCategory: "code" as const,
  },
  php: {
    type: "code",
    mimeType: "application/x-httpd-php",
    previewCategory: "code" as const,
  },
  rb: {
    type: "code",
    mimeType: "application/x-ruby",
    previewCategory: "code" as const,
  },
  go: { type: "code", mimeType: "text/x-go", previewCategory: "code" as const },
  rs: { type: "code", mimeType: "text/rust", previewCategory: "code" as const },
  cpp: {
    type: "code",
    mimeType: "text/x-c++",
    previewCategory: "code" as const,
  },
  c: { type: "code", mimeType: "text/x-c", previewCategory: "code" as const },
  cs: {
    type: "code",
    mimeType: "text/x-csharp",
    previewCategory: "code" as const,
  },
  sql: {
    type: "code",
    mimeType: "application/sql",
    previewCategory: "code" as const,
  },
  sh: {
    type: "code",
    mimeType: "application/x-sh",
    previewCategory: "code" as const,
  },
  bat: {
    type: "code",
    mimeType: "application/x-bat",
    previewCategory: "code" as const,
  },
  ps1: {
    type: "code",
    mimeType: "application/x-powershell",
    previewCategory: "code" as const,
  },

  // Unsupported files
  zip: {
    type: "archive",
    mimeType: "application/zip",
    previewCategory: "archive" as const,
  },
  rar: {
    type: "archive",
    mimeType: "application/vnd.rar",
    previewCategory: "archive" as const,
  },
  "7z": {
    type: "archive",
    mimeType: "application/x-7z-compressed",
    previewCategory: "archive" as const,
  },
  tar: {
    type: "archive",
    mimeType: "application/x-tar",
    previewCategory: "archive" as const,
  },
  gz: {
    type: "archive",
    mimeType: "application/gzip",
    previewCategory: "archive" as const,
  },
  ppt: {
    type: "document",
    mimeType: "application/vnd.ms-powerpoint",
    previewCategory: "office" as const,
  },
  pptx: {
    type: "document",
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    previewCategory: "office" as const,
  },
  heic: {
    type: "unsupported",
    mimeType: "image/heic",
    previewCategory: "default" as const,
  },
  heif: {
    type: "unsupported",
    mimeType: "image/heif",
    previewCategory: "default" as const,
  },
  ini: {
    type: "text",
    mimeType: "text/plain",
    previewCategory: "text" as const,
  },
  conf: {
    type: "text",
    mimeType: "text/plain",
    previewCategory: "text" as const,
  },
  env: {
    type: "text",
    mimeType: "text/plain",
    previewCategory: "text" as const,
  },
  log: {
    type: "text",
    mimeType: "text/plain",
    previewCategory: "text" as const,
  },
  lock: {
    type: "text",
    mimeType: "text/plain",
    previewCategory: "text" as const,
  },
} as const;

const PREVIEWABLE_TYPES = [
  "image",
  "video",
  "audio",
  "pdf",
  "spreadsheet",
  "text",
  "code",
  "document",
];

export function getFileTypeInfo(
  fileName: string,
  mimeType?: string,
): FileTypeInfo {
  const extension = fileName.toLowerCase().split(".").pop() || "";
  const typeInfo = FILE_TYPE_MAP[extension as keyof typeof FILE_TYPE_MAP];

  if (typeInfo) {
    return {
      type: typeInfo.type,
      extension,
      mimeType: typeInfo.mimeType || mimeType,
      isPreviewable: PREVIEWABLE_TYPES.includes(typeInfo.type),
      previewCategory: typeInfo.previewCategory,
      canDownload: true,
    };
  }

  // Fallback based on MIME type
  if (mimeType) {
    if (mimeType.startsWith("image/")) {
      return {
        type: "image",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "image",
        canDownload: true,
      };
    }
    if (mimeType.startsWith("video/")) {
      return {
        type: "video",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "video",
        canDownload: true,
      };
    }
    if (mimeType.startsWith("audio/")) {
      return {
        type: "audio",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "audio",
        canDownload: true,
      };
    }
    if (mimeType === "application/pdf") {
      return {
        type: "pdf",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "pdf",
        canDownload: true,
      };
    }
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return {
        type: "spreadsheet",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "spreadsheet",
        canDownload: true,
      };
    }
    if (mimeType.includes("word") || mimeType.includes("document")) {
      return {
        type: "document",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "document",
        canDownload: true,
      };
    }
    if (mimeType.startsWith("text/")) {
      return {
        type: "text",
        extension,
        mimeType,
        isPreviewable: true,
        previewCategory: "text",
        canDownload: true,
      };
    }
  }

  // Default to unsupported
  return {
    type: "unsupported",
    extension,
    mimeType,
    isPreviewable: false,
    previewCategory: "default",
    canDownload: true,
  };
}

export function getFileIcon(type: string): string {
  const icons = {
    image: "🖼️",
    video: "🎬",
    audio: "🎵",
    pdf: "📄",
    spreadsheet: "📊",
    document: "📝",
    text: "📄",
    code: "💻",
    archive: "📦",
    unsupported: "📁",
  };
  return icons[type as keyof typeof icons] || "📁";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
}
