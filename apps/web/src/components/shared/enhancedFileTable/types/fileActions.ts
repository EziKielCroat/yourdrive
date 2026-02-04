import type { LucideIcon } from "lucide-react";

export interface FileOwner {
  id: string;
  name: string;
  isYou?: boolean;
}

export interface EnhancedFileItem {
  id: string;
  name: string;
  mimeType?: string;
  extension?: string;
  size: number;
  isFolder?: boolean;
  isStarred?: boolean;
  isLocked?: boolean;
  owner?: FileOwner;
  path?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
}

export type FileActionId =
  | "preview"
  | "download"
  | "share"
  | "getLink"
  | "rename"
  | "duplicate"
  //  | "move"
  | "compress"
  | "extract"
  | "lock"
  | "unlock"
  | "optimize"
  | "watermark"
  | "generatePdf"
  | "star"
  | "unstar"
  | "delete"
  | "deletePermanently"
  | "restore"
  | "details";

export interface ActionContext {
  selectedFiles: EnhancedFileItem[];
  selectionCount: number;
  isRecycleBin: boolean;
  isShared: boolean;
  currentUser?: string;
}

export type ActionSlot = "selection-bar" | "context-menu" | "quick-menu";

export interface FileActionDefinition {
  id: FileActionId;
  label: string;
  icon: LucideIcon | React.ComponentType<{ size: number; className?: string }>;
  /** Human-readable shortcut string, e.g. "Alt+K R". */
  shortcut?: string;
  danger?: boolean;
  available: (context: ActionContext) => boolean;
}

export type ActionListItem = FileActionDefinition | "divider";

export interface UseFileActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  currentUser?: string;

  /** Called when the action flow wants to open the rename modal. */
  onOpenRenameModal: (file: EnhancedFileItem) => void;
  /** Called when the action flow wants to open the move modal. */
  onOpenMoveModal: (files: EnhancedFileItem[]) => void;
  /** Called when the action flow wants to open the details modal. */
  onOpenDetailsModal: (file: EnhancedFileItem) => void;
  /** Called when the action flow wants to open the watermark modal. */
  onOpenWatermarkModal: (files: EnhancedFileItem[]) => void;
  /** Called when the action flow wants to open the optimize modal. */
  onOpenOptimizeModal: (file: EnhancedFileItem) => void;
}

export interface ActionParams {
  newName?: string;
  targetFolderPath?: string;
  watermark?: {
    text?: string;
    position?: string;
    opacity?: number;
  };
  optimize?: {
    quality?: number;
    format?: string;
  };
  [key: string]: unknown;
}
