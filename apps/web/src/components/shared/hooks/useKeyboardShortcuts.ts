import { useEffect, useCallback, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  findActionByShortcut,
  getAvailableActions,
  type FileActionDefinition,
  type ActionEvaluationContext,
  type EnhancedFileItem,
  type FileActionId,
} from "../enhancedFileTable/fileActionsRegistry";

export interface UseKeyboardShortcutsOptions {
  selectedFiles: EnhancedFileItem[];
  isRecycleBin?: boolean;
  isShared?: boolean;
  currentUser?: string;
  enabled?: boolean;
  onActionExecuted?: (actionId: FileActionId) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onSelectAll?: () => void;
  onUnselectAll?: () => void;
}

export function useKeyboardShortcuts({
  selectedFiles,
  isRecycleBin = false,
  isShared = false,
  currentUser,
  enabled = true,
  onActionExecuted,
  onSuccess,
  onError,
  onSelectAll,
  onUnselectAll,
}: UseKeyboardShortcutsOptions) {
  const [isPrefixActive, setIsPrefixActive] = useState(false);
  const prefixTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Handle Ctrl+A for select all
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
        event.preventDefault();
        event.stopPropagation();
        onSelectAll?.();
        toast.success("All files selected");
        return;
      }

      // Handle Escape for unselect all
      if (event.key === "Escape" && selectedFiles.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        onUnselectAll?.();
        toast.success("Selection cleared");
        return;
      }

      // Check if this is the prefix key (Alt+K)
      if (event.altKey && event.key.toLowerCase() === "k" && !isPrefixActive) {
        event.preventDefault();
        event.stopPropagation();

        setIsPrefixActive(true);

        // Show toast notification
        toast.success("Shortcut mode activated - Press action key", {
          duration: 2000,
          icon: "⌨️",
        });

        // Clear any existing timeout
        if (prefixTimeoutRef.current) {
          clearTimeout(prefixTimeoutRef.current);
        }

        // Deactivate after 2 seconds
        prefixTimeoutRef.current = setTimeout(() => {
          setIsPrefixActive(false);
          toast.dismiss();
        }, 2000);

        return;
      }

      // If prefix is active, try to match an action
      if (isPrefixActive && selectedFiles.length > 0) {
        // Build context
        const context: ActionEvaluationContext = {
          selectedFiles,
          selectionCount: selectedFiles.length,
          isRecycleBin,
          isShared,
          currentUser,
        };

        // Get available actions for both contexts
        const selectionActions = getAvailableActions(
          "selection-bar",
          context,
          currentUser,
        );
        const quickMenuActions = getAvailableActions(
          "quick-menu",
          context,
          currentUser,
        );
        const allActions = [...selectionActions, ...quickMenuActions];

        // Find matching action
        const matchedAction = findActionByShortcut(
          event,
          allActions,
          isPrefixActive,
        );

        if (matchedAction) {
          event.preventDefault();
          event.stopPropagation();

          // Clear prefix state
          setIsPrefixActive(false);
          if (prefixTimeoutRef.current) {
            clearTimeout(prefixTimeoutRef.current);
          }

          // Show executing toast
          toast.loading(`Executing: ${matchedAction.label}...`, {
            id: "action-executing",
          });

          // Execute the action through the callback
          onActionExecuted?.(matchedAction.id);

          // Dismiss loading toast after a short delay
          setTimeout(() => {
            toast.dismiss("action-executing");
          }, 500);
        }
      }
    },
    [
      enabled,
      selectedFiles,
      isRecycleBin,
      isShared,
      currentUser,
      onActionExecuted,
      onSelectAll,
      onUnselectAll,
      isPrefixActive,
    ],
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (prefixTimeoutRef.current) {
        clearTimeout(prefixTimeoutRef.current);
      }
    };
  }, [enabled, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prefixTimeoutRef.current) {
        clearTimeout(prefixTimeoutRef.current);
      }
    };
  }, []);

  return {
    isPrefixActive,
  };
}

/**
 * Hook for displaying keyboard shortcuts in UI
 */
export function useShortcutHints(
  actions: FileActionDefinition[],
): Map<string, string> {
  const shortcuts = new Map<string, string>();

  actions.forEach((action) => {
    if (action.shortcut) {
      shortcuts.set(action.id, action.shortcut);
    }
  });

  return shortcuts;
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  return shortcut
    .replace(/Alt/g, "⌥")
    .replace(/Ctrl/g, "⌘")
    .replace(/Shift/g, "⇧")
    .replace(/Del/g, "⌫")
    .replace(/\+/g, " ");
}
