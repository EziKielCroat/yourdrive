import React from "react";
import styled from "styled-components";

interface FileTypeIconProps {
  fileName?: string;
  mimeType?: string;
  size?: number;
}

const getFileExtension = (fileName: string | undefined): string => {
  if (!fileName || typeof fileName !== "string") return "";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  return ext;
};

const getFileInfo = (fileName: string | undefined, mimeType?: string) => {
  const ext = getFileExtension(fileName);

  // Images
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) {
    return { type: "image", color: "#34a853", ext };
  }

  // Videos
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
    return { type: "video", color: "#ea4335", ext };
  }

  // Audio
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) {
    return { type: "audio", color: "#fbbc04", ext };
  }

  // PDF
  if (ext === "pdf") {
    return { type: "pdf", color: "#d93025", ext };
  }

  // Word
  if (["doc", "docx"].includes(ext)) {
    return { type: "word", color: "#4285f4", ext };
  }

  // Excel
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return { type: "excel", color: "#0f9d58", ext };
  }

  // PowerPoint
  if (["ppt", "pptx"].includes(ext)) {
    return { type: "powerpoint", color: "#f4b400", ext };
  }

  // Text
  if (["txt", "md", "log"].includes(ext)) {
    return { type: "text", color: "#5f6368", ext };
  }

  // Code
  if (
    ["js", "jsx", "ts", "tsx", "html", "css", "json", "py", "java"].includes(
      ext,
    )
  ) {
    return { type: "code", color: "#9334e6", ext };
  }

  // Archives
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return { type: "archive", color: "#8b572a", ext };
  }

  return { type: "file", color: "#5f6368", ext };
};

const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  fileName,
  mimeType,
  size = 32,
}) => {
  const { type, color, ext } = getFileInfo(fileName, mimeType);

  return (
    <IconContainer $size={size}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path
          d="M6 2C6 0.895431 6.89543 0 8 0H18L26 8V30C26 31.1046 25.1046 32 24 32H8C6.89543 32 6 31.1046 6 30V2Z"
          fill={color}
          opacity="0.1"
        />
        <path
          d="M6 2C6 0.895431 6.89543 0 8 0H18L26 8V30C26 31.1046 25.1046 32 24 32H8C6.89543 32 6 31.1046 6 30V2Z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M18 0L26 8H20C18.8954 8 18 7.10457 18 6V0Z"
          fill={color}
          opacity="0.3"
        />

        {type === "image" && (
          <>
            <rect
              x="10"
              y="14"
              width="12"
              height="10"
              rx="1"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="13" cy="17" r="1.5" fill={color} />
            <path
              d="M10 22L13 19L15 21L18 18L22 22"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {type === "video" && <path d="M10 14L20 19L10 24V14Z" fill={color} />}

        {type === "audio" && (
          <>
            <path
              d="M14 20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20C10 18.8954 10.8954 18 12 18C13.1046 18 14 18.8954 14 20Z"
              fill={color}
            />
            <path
              d="M14 20V14L22 12V18"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="18" r="2" fill={color} />
          </>
        )}

        {type === "pdf" && (
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill={color}
            fontSize="8"
            fontWeight="700"
          >
            PDF
          </text>
        )}

        {type === "word" && (
          <>
            <rect x="11" y="14" width="10" height="2" rx="0.5" fill={color} />
            <rect x="11" y="18" width="10" height="2" rx="0.5" fill={color} />
            <rect x="11" y="22" width="6" height="2" rx="0.5" fill={color} />
          </>
        )}

        {type === "excel" && (
          <>
            <rect
              x="10"
              y="14"
              width="12"
              height="10"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
            />
            <line
              x1="16"
              y1="14"
              x2="16"
              y2="24"
              stroke={color}
              strokeWidth="1.5"
            />
            <line
              x1="10"
              y1="19"
              x2="22"
              y2="19"
              stroke={color}
              strokeWidth="1.5"
            />
          </>
        )}

        {type === "powerpoint" && (
          <>
            <rect
              x="10"
              y="14"
              width="12"
              height="10"
              rx="1"
              fill={color}
              opacity="0.2"
            />
            <path d="M12 17H15L17 19L15 21H12V17Z" fill={color} />
          </>
        )}

        {type === "text" && (
          <>
            <line
              x1="11"
              y1="15"
              x2="21"
              y2="15"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="11"
              y1="19"
              x2="21"
              y2="19"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="11"
              y1="23"
              x2="17"
              y2="23"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {type === "code" && (
          <>
            <path
              d="M13 16L10 19L13 22"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 16L22 19L19 22"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="17"
              y1="15"
              x2="15"
              y2="23"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {type === "archive" && (
          <>
            <rect
              x="11"
              y="15"
              width="10"
              height="8"
              rx="1"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
            />
            <rect x="14" y="13" width="4" height="3" fill={color} />
          </>
        )}

        {type === "file" && (
          <>
            <line
              x1="11"
              y1="16"
              x2="21"
              y2="16"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="11"
              y1="20"
              x2="21"
              y2="20"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="11"
              y1="24"
              x2="17"
              y2="24"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      {ext && ext.length > 0 && ext.length <= 4 && (
        <Extension $color={color}>{ext.toUpperCase()}</Extension>
      )}
    </IconContainer>
  );
};

const IconContainer = styled.div<{ $size: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  flex-shrink: 0;
`;

const Extension = styled.span<{ $color: string }>`
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 8px;
  font-weight: 600;
  color: ${(props) => props.$color};
  background: white;
  padding: 2px 3px;
  border-radius: 3px;
  line-height: 1;
  border: 1px solid ${(props) => props.$color};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

export default FileTypeIcon;
