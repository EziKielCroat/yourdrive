import { useState, useCallback, useRef, useEffect } from "react";

import type { EnhancedFileItem, FileActionId } from "../types/fileActions";
import type { ActiveShortcutInfo } from "../types/keyboardShortcuts";
import {
  getDirectShortcuts,
  getPrefixedShortcuts,
} from "./keyboardShortcutsConfig";

interface UseKeyboardShortcutsProps {
  selectedFiles: EnhancedFileItem[];
  isRecycleBin: boolean;
  isShared: boolean;
  currentUser?: string;
  enabled: boolean;
  onActionExecuted: (
    actionId: FileActionId,
    files?: EnhancedFileItem[],
  ) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
}

interface UseKeyboardShortcutsReturn {
  /** True while the Alt+K prefix is active and we are waiting for the next key. */
  isPrefixActive: boolean;
  /** The last key pressed while the prefix was active (for the UI indicator). */
  currentKey: string | null;
  /** Human-readable info about what will happen if the user completes the shortcut. */
  shortcutInfo: ActiveShortcutInfo | null;
}

function normaliseKey(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push("ctrl");
  if (event.shiftKey) parts.push("shift");
  if (event.altKey) parts.push("alt");
  if (event.metaKey) parts.push("meta");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

function normalisePrefixedKey(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.shiftKey) parts.push("shift");
  parts.push(event.key.toLowerCase());
  return parts.join("+");
}

const isImageFile = (file: EnhancedFileItem): boolean =>
  file.mimeType?.startsWith("image/") ||
  ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(
    file.extension?.toLowerCase() ?? "",
  );

const isArchiveFile = (file: EnhancedFileItem): boolean =>
  ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(
    file.extension?.toLowerCase() ?? "",
  );

function validateAction(
  action: string,
  selectedFiles: EnhancedFileItem[],
  isRecycleBin: boolean,
  isShared: boolean,
): boolean {
  if (selectedFiles.length === 0) return false;

  const file = selectedFiles[0];

  switch (action) {
    case "preview":
      return selectedFiles.length === 1 && !file.isFolder;
    case "rename":
      return selectedFiles.length === 1 && !file.isLocked && !isShared;
    case "extract":
      return (
        selectedFiles.length === 1 && isArchiveFile(file) && !file.isLocked
      );
    case "optimize":
    case "watermark":
      return selectedFiles.length === 1 && isImageFile(file) && !file.isLocked;
    case "restore":
    case "deletePermanently":
      return isRecycleBin;
    case "delete":
      return !isRecycleBin && !file.isLocked && !isShared;
    case "lock":
      return !isShared && selectedFiles.every((f) => !f.isLocked);
    case "unlock":
      return !isShared && selectedFiles.every((f) => f.isLocked);
    case "star":
      return !isRecycleBin && selectedFiles.every((f) => !f.isStarred);
    case "unstar":
      return !isRecycleBin && selectedFiles.every((f) => f.isStarred);
    default:
      return true;
  }
}

const PREFIX_TIMEOUT_MS = 3000;

export function useKeyboardShortcuts(
  props: UseKeyboardShortcutsProps,
): UseKeyboardShortcutsReturn {
  const {
    selectedFiles,
    isRecycleBin,
    isShared,
    enabled,
    onActionExecuted,
    onSelectAll,
    onUnselectAll,
  } = props;

  const [isPrefixActive, setIsPrefixActive] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [shortcutInfo, setShortcutInfo] = useState<ActiveShortcutInfo | null>(
    null,
  );

  /** Single ref for the auto-cancel timer so we never have two running. */
  const prefixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPrefix = useCallback(() => {
    setIsPrefixActive(false);
    setCurrentKey(null);
    setShortcutInfo(null);
    if (prefixTimerRef.current) {
      clearTimeout(prefixTimerRef.current);
      prefixTimerRef.current = null;
    }
  }, []);

  const startPrefixTimer = useCallback(() => {
    if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
    prefixTimerRef.current = setTimeout(clearPrefix, PREFIX_TIMEOUT_MS);
  }, [clearPrefix]);

  const resolveStarAction = useCallback((): FileActionId => {
    const allStarred =
      selectedFiles.length > 0 && selectedFiles.every((f) => f.isStarred);
    return allStarred ? "unstar" : "star";
  }, [selectedFiles]);

  const resolveLockAction = useCallback((): FileActionId => {
    const allLocked =
      selectedFiles.length > 0 && selectedFiles.every((f) => f.isLocked);
    return allLocked ? "unlock" : "lock";
  }, [selectedFiles]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      if (event.altKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsPrefixActive(true);
        setCurrentKey(null);
        setShortcutInfo(null);
        startPrefixTimer();
        return;
      }

      const directMap = getDirectShortcuts();
      const normDirect = normaliseKey(event);

      if (directMap[normDirect] && !directMap[normDirect].requiresPrefix) {
        event.preventDefault();
        const { action } = directMap[normDirect];
        if (action === "selectAll") onSelectAll();
        if (action === "clearSelection") onUnselectAll();
        return;
      }

      if (isPrefixActive) {
        event.preventDefault();

        const prefixedMap = getPrefixedShortcuts();
        const normPrefixed = normalisePrefixedKey(event);

        const shortcutDef = prefixedMap[normPrefixed];
        if (!shortcutDef || !shortcutDef.requiresPrefix) {
          clearPrefix();
          return;
        }

        setCurrentKey(normPrefixed);
        setShortcutInfo({
          key: normPrefixed,
          action: shortcutDef.action,
          description: shortcutDef.description ?? shortcutDef.action,
        });

        let actionId = shortcutDef.action as FileActionId;
        if (actionId === "star") actionId = resolveStarAction();
        if (actionId === "lock") actionId = resolveLockAction();

        if (validateAction(actionId, selectedFiles, isRecycleBin, isShared)) {
          setTimeout(() => {
            onActionExecuted(actionId, selectedFiles);
            clearPrefix();
          }, 150);
        } else {
          clearPrefix();
        }
      }
    },
    [
      enabled,
      isPrefixActive,
      selectedFiles,
      isRecycleBin,
      isShared,
      onActionExecuted,
      onSelectAll,
      onUnselectAll,
      clearPrefix,
      startPrefixTimer,
      resolveStarAction,
      resolveLockAction,
    ],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  useEffect(() => {
    return () => {
      if (prefixTimerRef.current) clearTimeout(prefixTimerRef.current);
    };
  }, []);

  return { isPrefixActive, currentKey, shortcutInfo };
}
