export type FileType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "code"
  | "office"
  | "unsupported";

// Comprehensive file extension lists
const imageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  "tiff",
  "tif",
  "apng",
  "avif",
  "jfif",
  "pjpeg",
  "pjp",
  "heic",
  "heif",
  "raw",
  "cr2",
  "nef",
];

const videoExtensions = [
  "mp4",
  "webm",
  "ogg",
  "ogv",
  "mov",
  "avi",
  "wmv",
  "flv",
  "mkv",
  "m4v",
  "mpg",
  "mpeg",
  "mpe",
  "mpv",
  "m2v",
  "3gp",
  "3g2",
  "mxf",
  "roq",
  "nsv",
  "f4v",
  "f4p",
  "f4a",
  "f4b",
  "qt",
  "yuv",
  "rm",
  "rmvb",
  "vob",
  "asf",
];

const audioExtensions = [
  "mp3",
  "wav",
  "ogg",
  "oga",
  "aac",
  "flac",
  "m4a",
  "wma",
  "opus",
  "aiff",
  "aif",
  "aifc",
  "au",
  "snd",
  "mid",
  "midi",
  "rmi",
  "mka",
  "ape",
  "ac3",
  "dts",
  "wv",
  "webm",
  "amr",
  "3ga",
  "awb",
];

export const documentExtensions = [
  "pdf",
  "txt",
  "md",
  "markdown",
  "rtf",
  "tex",
  "log",
  "msg",
  "pages",
  "wpd",
  "wps",
  "odt",
  "ott",
  "fodt",
  "doc",
  "docx",
];

const codeExtensions = [
  // Web
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "html",
  "htm",
  "xhtml",
  "css",
  "scss",
  "sass",
  "less",
  "styl",
  // JavaScript ecosystem
  "vue",
  "svelte",
  "mjs",
  "cjs",
  // Python
  "py",
  "pyw",
  "pyx",
  "pxd",
  "pxi",
  "py3",
  "ipynb",
  // Java/JVM
  "java",
  "class",
  "jar",
  "kt",
  "kts",
  "ktm",
  "scala",
  "sc",
  "groovy",
  "gradle",
  // C/C++
  "c",
  "cpp",
  "cxx",
  "cc",
  "c++",
  "h",
  "hpp",
  "hxx",
  "hh",
  "h++",
  // C#/.NET
  "cs",
  "csx",
  "vb",
  "fs",
  "fsx",
  "fsi",
  // Mobile
  "swift",
  "m",
  "mm",
  // Go
  "go",
  // Rust
  "rs",
  "rlib",
  // PHP
  "php",
  "phtml",
  "php3",
  "php4",
  "php5",
  "phps",
  // Ruby
  "rb",
  "erb",
  "rake",
  "gemspec",
  // Shell
  "sh",
  "bash",
  "zsh",
  "fish",
  "ksh",
  "csh",
  "tcsh",
  // Config/Data
  "xml",
  "yaml",
  "yml",
  "toml",
  "ini",
  "cfg",
  "conf",
  "config",
  "properties",
  "env",
  "envrc",
  "editorconfig",
  // SQL
  "sql",
  "mysql",
  "pgsql",
  "sqlite",
  // Other languages
  "r",
  "R",
  "rmd",
  "Rmd",
  "pl",
  "pm",
  "lua",
  "clj",
  "cljs",
  "cljc",
  "edn",
  "dart",
  "erl",
  "hrl",
  "ex",
  "exs",
  "elm",
  "ml",
  "mli",
  "nim",
  "nix",
  "hs",
  "lhs",
  "vhdl",
  "vhd",
  "v",
  "sv",
  "svh",
  "f90",
  "f95",
  "f03",
  // Markup/Documentation
  "rst",
  "adoc",
  "asciidoc",
  "textile",
  // Build/Project files
  "dockerfile",
  "makefile",
  "cmake",
  "gradle",
  "ant",
  "maven",
  "sln",
  "vcxproj",
  "csproj",
  "fsproj",
  "vbproj",
  "package.json",
  "tsconfig.json",
  "jsconfig.json",
  // Version control
  "gitignore",
  "gitattributes",
  "gitmodules",
  "hgignore",
  // Other
  "asm",
  "s",
  "proto",
  "graphql",
  "gql",
  "prisma",
  "sol",
  "move",
];

const officeExtensions = [
  // Word
  "doc",
  "docx",
  "docm",
  "dot",
  "dotx",
  "dotm",
  "odt",
  "ott",
  "fodt",
  // Excel
  "xls",
  "xlsx",
  "xlsm",
  "xlsb",
  "xlt",
  "xltx",
  "xltm",
  "ods",
  "ots",
  "fods",
  "csv",
  // PowerPoint
  "ppt",
  "pptx",
  "pptm",
  "pps",
  "ppsx",
  "ppsm",
  "pot",
  "potx",
  "potm",
  "odp",
  "otp",
  "fodp",
  // Other Office
  "pub",
  "xps",
  "oxps",
];

// MIME type mappings
const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/avif",
  "image/apng",
  "image/heic",
  "image/heif",
];

const videoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-ms-wmv",
  "video/x-flv",
  "video/x-matroska",
  "video/3gpp",
  "video/3gpp2",
  "video/mpeg",
  "video/x-m4v",
];

const audioMimeTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/x-aac",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wma",
  "audio/x-ms-wma",
  "audio/opus",
  "audio/webm",
  "audio/aiff",
  "audio/x-aiff",
];

const documentMimeTypes = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "application/rtf",
  "text/rtf",
  "application/x-tex",
];

const codeMimeTypes = [
  "text/javascript",
  "application/javascript",
  "text/typescript",
  "application/typescript",
  "text/html",
  "application/xhtml+xml",
  "text/css",
  "application/json",
  "text/xml",
  "application/xml",
  "text/x-python",
  "text/x-java",
  "text/x-c",
  "text/x-c++",
  "text/x-csharp",
  "text/x-php",
  "text/x-ruby",
  "text/x-go",
  "text/x-rust",
  "text/x-swift",
  "text/x-sh",
  "application/x-sh",
  "text/x-yaml",
  "application/x-yaml",
  "text/yaml",
  "application/toml",
  "text/toml",
];

const officeMimeTypes = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-word.document.macroEnabled.12",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel.sheet.macroEnabled.12",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "text/csv",
  "application/csv",
];

export const getFileExtension = (fileName: string): string => {
  if (!fileName) return "";
  const parts = fileName.split(".");
  if (parts.length === 1) return "";
  return parts[parts.length - 1].toLowerCase();
};

export const detectFileType = (
  fileName: string,
  mimeType?: string
): FileType => {
  if (!fileName && !mimeType) return "unsupported";

  const extension = getFileExtension(fileName);

  // Check MIME type first if provided
  if (mimeType) {
    const mime = mimeType.toLowerCase();

    if (
      imageMimeTypes.some(
        (type) => mime.includes(type.toLowerCase()) || mime.startsWith("image/")
      )
    ) {
      return "image";
    }
    if (
      videoMimeTypes.some(
        (type) => mime.includes(type.toLowerCase()) || mime.startsWith("video/")
      )
    ) {
      return "video";
    }
    if (
      audioMimeTypes.some(
        (type) => mime.includes(type.toLowerCase()) || mime.startsWith("audio/")
      )
    ) {
      return "audio";
    }

    if (
      codeMimeTypes.some(
        (type) =>
          mime.includes(type.toLowerCase()) ||
          mime.startsWith("code/") ||
          mime.startsWith("octet-stream/")
      )
    ) {
      return "code";
    }
    if (documentMimeTypes.some((type) => mime.includes(type.toLowerCase()))) {
      return "document";
    }
    if (documentExtensions.includes(extension)) {
      return "document";
    }
    if (codeExtensions.includes(extension)) {
      return "code";
    }
    if (officeMimeTypes.some((type) => mime.includes(type.toLowerCase()))) {
      return "office";
    }
  }

  // Fall back to extension checking
  if (!extension) return "unsupported";

  if (imageExtensions.includes(extension)) return "image";
  if (videoExtensions.includes(extension)) return "video";
  if (audioExtensions.includes(extension)) return "audio";
  if (documentExtensions.includes(extension)) return "document";
  if (codeExtensions.includes(extension)) return "code";
  if (officeExtensions.includes(extension)) return "office";

  // Default text files to code
  if (mimeType?.startsWith("text/")) return "code";

  return "unsupported";
};

export const getLanguageFromExtension = (fileName: string): string => {
  const extension = getFileExtension(fileName);

  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    ts: "typescript",
    tsx: "typescript",

    // Web
    json: "json",
    html: "html",
    htm: "html",
    xhtml: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    styl: "stylus",

    // Frameworks
    vue: "vue",
    svelte: "svelte",

    // Python
    py: "python",
    pyw: "python",
    pyx: "python",
    pxd: "python",
    pxi: "python",
    py3: "python",

    // Java/JVM
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    ktm: "kotlin",
    scala: "scala",
    sc: "scala",
    groovy: "groovy",
    gradle: "groovy",

    // C/C++
    c: "c",
    cpp: "cpp",
    cxx: "cpp",
    cc: "cpp",
    "c++": "cpp",
    h: "c",
    hpp: "cpp",
    hxx: "cpp",
    hh: "cpp",
    "h++": "cpp",

    // C#/.NET
    cs: "csharp",
    csx: "csharp",
    vb: "vb",
    fs: "fsharp",
    fsx: "fsharp",
    fsi: "fsharp",

    // Mobile
    swift: "swift",
    m: "objective-c",
    mm: "objective-cpp",

    // Go
    go: "go",

    // Rust
    rs: "rust",

    // PHP
    php: "php",
    phtml: "php",
    php3: "php",
    php4: "php",
    php5: "php",
    phps: "php",

    // Ruby
    rb: "ruby",
    erb: "erb",
    rake: "ruby",
    gemspec: "ruby",

    // Shell
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    ksh: "shell",
    csh: "shell",
    tcsh: "shell",

    // Config/Data
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
    config: "ini",
    properties: "properties",
    env: "shell",

    // SQL
    sql: "sql",
    mysql: "sql",
    pgsql: "sql",

    // Other languages
    r: "r",
    rmd: "r",
    pl: "perl",
    pm: "perl",
    lua: "lua",
    clj: "clojure",
    cljs: "clojure",
    cljc: "clojure",
    dart: "dart",
    erl: "erlang",
    hrl: "erlang",
    ex: "elixir",
    exs: "elixir",
    elm: "elm",
    ml: "ocaml",
    mli: "ocaml",
    nim: "nim",
    hs: "haskell",
    lhs: "haskell",

    // Markup
    md: "markdown",
    markdown: "markdown",
    rst: "restructuredtext",
    adoc: "asciidoc",
    asciidoc: "asciidoc",

    // Build/Project
    dockerfile: "dockerfile",
    makefile: "makefile",
    cmake: "cmake",

    // Other
    graphql: "graphql",
    gql: "graphql",
    proto: "protobuf",
    sol: "sol",
    asm: "asm",
    s: "asm",

    // Plain text
    txt: "plaintext",
    log: "plaintext",
  };

  return languageMap[extension] || "plaintext";
};

export const isImageFile = (fileName: string, mimeType?: string): boolean => {
  return detectFileType(fileName, mimeType) === "image";
};

export const isVideoFile = (fileName: string, mimeType?: string): boolean => {
  return detectFileType(fileName, mimeType) === "video";
};

export const isAudioFile = (fileName: string, mimeType?: string): boolean => {
  return detectFileType(fileName, mimeType) === "audio";
};

export const isDocumentFile = (
  fileName: string,
  mimeType?: string
): boolean => {
  return detectFileType(fileName, mimeType) === "document";
};

export const isCodeFile = (fileName: string, mimeType?: string): boolean => {
  return detectFileType(fileName, mimeType) === "code";
};

export const isOfficeFile = (fileName: string, mimeType?: string): boolean => {
  return detectFileType(fileName, mimeType) === "office";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  if (!bytes || isNaN(bytes)) return "Unknown";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getFileIcon = (fileName: string, mimeType?: string): string => {
  const type = detectFileType(fileName, mimeType);

  const iconMap: Record<FileType, string> = {
    image: "🖼️",
    video: "🎬",
    audio: "🎵",
    document: "📄",
    code: "💻",
    office: "📊",
    unsupported: "📁",
  };

  return iconMap[type];
};

export const canPreview = (fileName: string, mimeType?: string): boolean => {
  const type = detectFileType(fileName, mimeType);
  return type !== "unsupported";
};

// Helper to check if URL is valid
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a blob URL or data URL
    return url.startsWith("blob:") || url.startsWith("data:");
  }
};
