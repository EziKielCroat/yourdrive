import React, { useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { Star } from "lucide-react";

import type {
  FileActionDefinition,
  EnhancedFileItem,
  FileActionId,
  ActionListItem,
} from "./types/fileActions";
import { getAvailableActions } from "./utils/fileActionRegistry";

interface FileContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  selectedFiles: EnhancedFileItem[];
  isRecycleBin: boolean;
  isShared: boolean;
  currentUser?: string;
  onAction: (actionId: FileActionId, files: EnhancedFileItem[]) => void;
  onClose: () => void;
}

const swoopIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
    transform-origin: top left;
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
    transform-origin: top left;
  }
`;

const ContextMenuContainer = styled.div<{
  $visible: boolean;
  $x: number;
  $y: number;
}>`
  position: fixed;
  left: ${(props) => props.$x}px;
  top: ${(props) => props.$y}px;
  z-index: 9999;
  min-width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 4px 32px rgba(0, 0, 0, 0.12),
    0 8px 48px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) => (props.$visible ? "scale(1)" : "scale(0.8)")};
  transform-origin: top left;
  animation: ${(props) =>
    props.$visible
      ? css`
          ${swoopIn} 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)
        `
      : "none"};
  pointer-events: ${(props) => (props.$visible ? "all" : "none")};
  border: 1px solid #e0e0e0;
  overflow: hidden;
`;

const ContextMenuInner = styled.div`
  max-height: 480px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const ContextMenuItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  color: ${(props) => (props.$danger ? "#d93025" : "#202124")};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

  &:hover {
    background: ${(props) => (props.$danger ? "#fce8e6" : "#f1f3f4")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
    color: ${(props) => (props.$danger ? "#d93025" : "#5f6368")};
    width: 16px;
    height: 16px;
  }

  span {
    flex: 1;
  }
`;

const ContextMenuDivider = styled.div`
  height: 1px;
  background: #e8eaed;
  margin: 8px 0;
`;

const ContextMenuShortcut = styled.span`
  font-size: 11px;
  color: #5f6368;
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  margin-left: auto;
  margin-right: 4px;
`;

const ContextMenuHeader = styled.div`
  padding: 12px 16px 8px;
  border-bottom: 1px solid #e8eaed;
  margin-bottom: 8px;
`;

const ContextMenuTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #5f6368;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ContextMenuSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: #9aa0a6;
`;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("text/")) return "Text";
  if (mimeType.includes("spreadsheet")) return "Spreadsheet";
  if (mimeType.includes("document")) return "Document";
  if (mimeType.includes("presentation")) return "Presentation";
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return "Archive";
  return "File";
}

const StarIcon: React.FC<{
  size: number;
  className?: string;
  filled?: boolean;
}> = ({ size, className, filled = false }) => (
  <Star
    size={size}
    className={className}
    fill={filled ? "#fbbc04" : "none"}
    stroke={filled ? "#fbbc04" : "currentColor"}
  />
);

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  visible,
  x,
  y,
  selectedFiles,
  isRecycleBin,
  isShared,
  currentUser,
  onAction,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const vW = window.innerWidth;
    const vH = window.innerHeight;

    const adjustedX = x + rect.width > vW ? vW - rect.width - 10 : x;
    const adjustedY = y + rect.height > vH ? vH - rect.height - 10 : y;

    if (adjustedX !== x || adjustedY !== y) {
      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [visible, x, y]);

  if (!visible) return null;

  const actions: ActionListItem[] = getAvailableActions("context-menu", {
    selectedFiles,
    selectionCount: selectedFiles.length,
    isRecycleBin,
    isShared,
    currentUser,
  });

  return (
    <ContextMenuContainer ref={menuRef} $visible={visible} $x={x} $y={y}>
      <ContextMenuHeader>
        <ContextMenuTitle>
          {selectedFiles.length === 1
            ? selectedFiles[0].name
            : `${selectedFiles.length} selected`}
        </ContextMenuTitle>
        {selectedFiles.length === 1 && (
          <ContextMenuSubtitle>
            {formatFileSize(selectedFiles[0].size ?? 0)}
            {selectedFiles[0].mimeType &&
              ` • ${getFileType(selectedFiles[0].mimeType)}`}
          </ContextMenuSubtitle>
        )}
      </ContextMenuHeader>

      <ContextMenuInner>
        {actions.map((item, index) => {
          if (item === "divider") {
            return <ContextMenuDivider key={`divider-${index}`} />;
          }

          const action = item as FileActionDefinition;

          const isStar = action.id === "star";
          const isUnstar = action.id === "unstar";

          return (
            <ContextMenuItem
              key={action.id}
              $danger={action.danger}
              onClick={() => {
                onAction(action.id, selectedFiles);
                onClose();
              }}
            >
              {isStar || isUnstar ? (
                <StarIcon size={16} filled={isUnstar} />
              ) : (
                <action.icon size={16} />
              )}

              <span>{action.label}</span>

              {action.shortcut && (
                <ContextMenuShortcut>
                  {action.shortcut.split(" ").slice(1).join("+")}
                </ContextMenuShortcut>
              )}
            </ContextMenuItem>
          );
        })}
      </ContextMenuInner>
    </ContextMenuContainer>
  );
};
