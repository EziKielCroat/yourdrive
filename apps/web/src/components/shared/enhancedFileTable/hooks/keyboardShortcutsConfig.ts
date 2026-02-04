import type { ShortcutMap } from "../types/keyboardShortcuts";

const DIRECT_SHORTCUTS: ShortcutMap = {
  escape: {
    action: "clearSelection",
    requiresPrefix: false,
  },
  "ctrl+a": {
    action: "selectAll",
    requiresPrefix: false,
  },
};

const PREFIXED_SHORTCUTS: ShortcutMap = {
  p: { action: "preview", requiresPrefix: true, description: "Preview file" },
  r: { action: "rename", requiresPrefix: true, description: "Rename" },
  d: { action: "duplicate", requiresPrefix: true, description: "Duplicate" },
  w: { action: "download", requiresPrefix: true, description: "Download" },
  s: { action: "share", requiresPrefix: true, description: "Share" },
  l: { action: "getLink", requiresPrefix: true, description: "Get link" },
  f: {
    action: "star",
    requiresPrefix: true,
    description: "Star / Unstar",
  },
  z: { action: "compress", requiresPrefix: true, description: "Compress" },
  e: { action: "extract", requiresPrefix: true, description: "Extract" },
  x: { action: "delete", requiresPrefix: true, description: "Delete" },
  //v: { action: "move", requiresPrefix: true, description: "Move" },
  m: { action: "watermark", requiresPrefix: true, description: "Watermark" },
  o: { action: "optimize", requiresPrefix: true, description: "Optimize" },
  i: { action: "details", requiresPrefix: true, description: "Details" },
  k: {
    action: "lock",
    requiresPrefix: true,
    description: "Lock / Unlock",
  },

  // Recycle-bin actions
  u: { action: "restore", requiresPrefix: true, description: "Restore" },
  "shift+x": {
    action: "deletePermanently",
    requiresPrefix: true,
    description: "Delete permanently",
  },
};

export const ALL_SHORTCUTS: ShortcutMap = {
  ...DIRECT_SHORTCUTS,
  ...PREFIXED_SHORTCUTS,
};

export const getDirectShortcuts = (): ShortcutMap => DIRECT_SHORTCUTS;

export const getPrefixedShortcuts = (): ShortcutMap => PREFIXED_SHORTCUTS;
