import {
  Eye,
  Download,
  Share2,
  Link,
  Copy,
  Move,
  Archive,
  FileArchive,
  Lock,
  Unlock,
  Image,
  Type,
  FileText,
  Star,
  Trash2,
  RotateCcw,
  Info,
  X,
} from "lucide-react";

import type {
  EnhancedFileItem,
  FileActionDefinition,
  FileActionId,
  ActionContext,
  ActionSlot,
  ActionListItem,
} from "../types/fileActions";

const isImageFile = (file: EnhancedFileItem): boolean =>
  file.mimeType?.startsWith("image/") ||
  ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(
    file.extension?.toLowerCase() ?? "",
  );

const isArchiveFile = (file: EnhancedFileItem): boolean =>
  ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(
    file.extension?.toLowerCase() ?? "",
  );

const registry: Record<FileActionId, FileActionDefinition> = {
  preview: {
    id: "preview",
    label: "Preview",
    icon: Eye,
    shortcut: "Alt+K P",
    available: (ctx: ActionContext) =>
      ctx.selectionCount === 1 && !ctx.selectedFiles[0].isFolder,
  },

  download: {
    id: "download",
    label: "Download",
    icon: Download,
    shortcut: "Alt+K W",
    available: () => true,
  },

  share: {
    id: "share",
    label: "Share",
    icon: Share2,
    shortcut: "Alt+K S",
    available: (ctx: ActionContext) => !ctx.isRecycleBin,
  },

  getLink: {
    id: "getLink",
    label: "Get link",
    icon: Link,
    shortcut: "Alt+K L",
    available: (ctx: ActionContext) =>
      ctx.selectionCount === 1 && !ctx.isRecycleBin,
  },

  rename: {
    id: "rename",
    label: "Rename",
    icon: Type,
    shortcut: "Alt+K R",
    available: (ctx: ActionContext) =>
      ctx.selectionCount === 1 &&
      !ctx.selectedFiles[0].isLocked &&
      !ctx.isShared,
  },

  duplicate: {
    id: "duplicate",
    label: "Duplicate",
    icon: Copy,
    shortcut: "Alt+K D",
    available: (ctx: ActionContext) =>
      !ctx.selectedFiles.some((f) => f.isLocked) && !ctx.isRecycleBin,
  },

  // move: {
  //   id: "move",
  //   label: "Move",
  //   icon: Move,
  //   shortcut: "Alt+K V",
  //   available: (ctx: ActionContext) =>
  //     !ctx.selectedFiles.some((f) => f.isLocked) &&
  //     !ctx.isRecycleBin &&
  //     !ctx.isShared,
  // },

  compress: {
    id: "compress",
    label: "Compress",
    icon: Archive,
    shortcut: "Alt+K Z",
    available: (ctx: ActionContext) =>
      !ctx.selectedFiles.some((f) => f.isLocked || isArchiveFile(f)) &&
      !ctx.isRecycleBin,
  },

  extract: {
    id: "extract",
    label: "Extract",
    icon: FileArchive,
    shortcut: "Alt+K E",
    available: (ctx: ActionContext) =>
      ctx.selectionCount === 1 &&
      isArchiveFile(ctx.selectedFiles[0]) &&
      !ctx.selectedFiles[0].isLocked &&
      !ctx.isRecycleBin,
  },

  lock: {
    id: "lock",
    label: "Lock",
    icon: Lock,
    shortcut: "Alt+K K",
    available: (ctx: ActionContext) =>
      !ctx.isRecycleBin &&
      !ctx.isShared &&
      ctx.selectedFiles.every((f) => !f.isLocked),
  },

  unlock: {
    id: "unlock",
    label: "Unlock",
    icon: Unlock,
    shortcut: "Alt+K K",
    available: (ctx: ActionContext) =>
      !ctx.isRecycleBin &&
      !ctx.isShared &&
      ctx.selectedFiles.every((f) => f.isLocked),
  },

  // optimize: {
  //   id: "optimize",
  //   label: "Optimize image",
  //   icon: Image,
  //   shortcut: "Alt+K O",
  //   available: (ctx: ActionContext) =>
  //     ctx.selectionCount === 1 &&
  //     isImageFile(ctx.selectedFiles[0]) &&
  //     !ctx.selectedFiles[0].isLocked &&
  //     !ctx.isRecycleBin,
  // },

  watermark: {
    id: "watermark",
    label: "Add watermark",
    icon: Type,
    shortcut: "Alt+K M",
    available: (ctx: ActionContext) =>
      ctx.selectionCount === 1 &&
      isImageFile(ctx.selectedFiles[0]) &&
      !ctx.selectedFiles[0].isLocked &&
      !ctx.isRecycleBin,
  },

  generatePdf: {
    id: "generatePdf",
    label: "Generate PDF",
    icon: FileText,
    shortcut: "",
    available: (ctx: ActionContext) =>
      ctx.selectionCount >= 1 &&
      !ctx.selectedFiles.some((f) => f.isLocked) &&
      !ctx.isRecycleBin &&
      !ctx.isShared,
  },

  star: {
    id: "star",
    label: "Star",
    icon: Star,
    shortcut: "Alt+K F",
    available: (ctx: ActionContext) =>
      !ctx.isRecycleBin && ctx.selectedFiles.some((f) => !f.isStarred),
  },

  unstar: {
    id: "unstar",
    label: "Unstar",
    icon: Star,
    shortcut: "Alt+K F",
    available: (ctx: ActionContext) =>
      !ctx.isRecycleBin && ctx.selectedFiles.some((f) => f.isStarred),
  },

  delete: {
    id: "delete",
    label: "Delete",
    icon: Trash2,
    shortcut: "Alt+K X",
    danger: true,
    available: (ctx: ActionContext) =>
      !ctx.isRecycleBin &&
      !ctx.selectedFiles.some((f) => f.isLocked) &&
      !ctx.isShared,
  },

  deletePermanently: {
    id: "deletePermanently",
    label: "Delete permanently",
    icon: X,
    shortcut: "Alt+K Shift+X",
    danger: true,
    available: (ctx: ActionContext) => ctx.isRecycleBin,
  },

  restore: {
    id: "restore",
    label: "Restore",
    icon: RotateCcw,
    shortcut: "Alt+K U",
    available: (ctx: ActionContext) => ctx.isRecycleBin,
  },

  details: {
    id: "details",
    label: "Details",
    icon: Info,
    shortcut: "Alt+K I",
    available: (ctx: ActionContext) => ctx.selectionCount === 1,
  },
};

const CONTEXT_MENU_GROUPS: readonly (readonly FileActionId[])[] = [
  ["preview", "details"],
  ["rename", "duplicate", "move"],
  ["share", "getLink"],
  ["compress", "extract", "optimize", "watermark", "generatePdf"],
  ["lock", "unlock", "star", "unstar"],
  ["delete", "deletePermanently", "restore"],
] as const;

const SELECTION_BAR_PRIORITY: readonly FileActionId[] = [
  "download",
  "share",
  "move",
  "compress",
  "star",
  "unstar",
  "delete",
] as const;

export function getAvailableActions(
  slot: ActionSlot,
  context: ActionContext,
): ActionListItem[] {
  const passing = Object.values(registry).filter((def) =>
    def.available(context),
  );

  if (context.currentUser) {
    const idx = passing.findIndex((a) => a.id === "delete");
    if (idx !== -1) {
      const isOwner = context.selectedFiles.every(
        (f) => f.owner?.name === context.currentUser || f.owner?.isYou,
      );
      if (!isOwner) passing.splice(idx, 1);
    }
  }

  return sortForSlot(passing, slot);
}

function sortForSlot(
  actions: FileActionDefinition[],
  slot: ActionSlot,
): ActionListItem[] {
  switch (slot) {
    case "selection-bar":
      return sortSelectionBar(actions);
    case "context-menu":
    case "quick-menu":
      return sortGrouped(actions);
  }
}

/** Toolbar: show only the priority set, in the declared order. */
function sortSelectionBar(actions: FileActionDefinition[]): ActionListItem[] {
  const inPriority = SELECTION_BAR_PRIORITY.map((id) =>
    actions.find((a) => a.id === id),
  ).filter((a): a is FileActionDefinition => a !== undefined);

  const rest = actions.filter((a) => !SELECTION_BAR_PRIORITY.includes(a.id));

  return [...inPriority, ...rest];
}

function sortGrouped(actions: FileActionDefinition[]): ActionListItem[] {
  const result: ActionListItem[] = [];
  const actionById = new Map(actions.map((a) => [a.id, a]));

  for (const group of CONTEXT_MENU_GROUPS) {
    const bucket = group
      .map((id) => actionById.get(id))
      .filter((a): a is FileActionDefinition => a !== undefined);

    if (bucket.length === 0) continue;

    if (result.length > 0) result.push("divider");

    result.push(...bucket);
  }

  return result;
}

export function getActionById(
  id: FileActionId,
): FileActionDefinition | undefined {
  return registry[id];
}

export const fileActionsRegistry = Object.freeze(registry);
