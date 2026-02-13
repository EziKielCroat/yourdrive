import { getAvailableActions } from "../utils/fileActionRegistry";
import { toast } from "../../../../services/toast.service";
import { useCallback } from "react";
import type {
  EnhancedFileItem,
  FileActionId,
  ActionListItem,
  UseFileActionsOptions,
  ActionParams,
} from "../types/fileActions";
import { useFileActionsStore } from "../store/useFileActionsStore";

import {
  downloadSingleFile,
  downloadMultipleFiles,
  copyToClipboard,
  apiDuplicate,
  apiShare,
  apiGetLink,
  apiCompress,
  apiExtract,
  apiLock,
  apiUnlock,
  apiGeneratePdf,
  apiStar,
  apiUnstar,
  apiDelete,
  apiDeletePermanently,
  apiRestore,
} from "../utils/fileActions";
import { usePopupStore } from "../../popups/popup.store";

export function useFileActions(options: UseFileActionsOptions) {
  const {
    onSuccess,
    onError,
    currentUser,
    onOpenRenameModal,
    onOpenMoveModal,
    onOpenDetailsModal,
    onOpenWatermarkModal,
    onOpenOptimizeModal,
    onRestoreFile,
    onDeletePermanently,
  } = options;

  const { isExecuting, markStart, markEnd } = useFileActionsStore();

  const getSelectionBarActions = useCallback(
    (
      selectedFiles: EnhancedFileItem[],
      isRecycleBin: boolean,
      isShared: boolean,
    ): ActionListItem[] =>
      getAvailableActions("selection-bar", {
        selectedFiles,
        selectionCount: selectedFiles.length,
        isRecycleBin,
        isShared,
        currentUser,
      }),
    [currentUser],
  );

  const getQuickMenuActions = useCallback(
    (
      file: EnhancedFileItem,
      isRecycleBin: boolean,
      isShared: boolean,
    ): ActionListItem[] =>
      getAvailableActions("quick-menu", {
        selectedFiles: [file],
        selectionCount: 1,
        isRecycleBin,
        isShared,
        currentUser,
      }),
    [currentUser],
  );

  const executeAction = useCallback(
    async (
      actionId: FileActionId,
      files: EnhancedFileItem[],
      params: ActionParams = {},
    ): Promise<void> => {
      if (files.length === 0) {
        toast.error("No files selected");
        return;
      }

      // Handle modal actions
      if (actionId === "rename") {
        if (onOpenRenameModal && files.length === 1) {
          onOpenRenameModal(files[0]);
        }
        return;
      }

      if (actionId === "move") {
        if (onOpenMoveModal) {
          onOpenMoveModal(files);
        }
        return;
      }

      if (actionId === "details") {
        if (onOpenDetailsModal && files.length === 1) {
          onOpenDetailsModal(files[0]);
        }
        return;
      }

      if (actionId === "watermark") {
        if (onOpenWatermarkModal && files.length === 1) {
          onOpenWatermarkModal(files);
        }
        return;
      }

      if (actionId === "optimize") {
        if (onOpenOptimizeModal && files.length === 1) {
          onOpenOptimizeModal(files[0]);
        }
        return;
      }

      if (actionId === "restore" && onRestoreFile) {
        markStart();
        try {
          for (const f of files) await onRestoreFile(f.id);
          onSuccess?.();
        } catch (err) {
          const e = err instanceof Error ? err : new Error("Restore failed");
          toast.error(e.message);
          onError?.(e);
        } finally {
          markEnd();
        }
        return;
      }

      if (actionId === "deletePermanently" && onDeletePermanently) {
        markStart();
        try {
          for (const f of files) await onDeletePermanently(f.id);
          onSuccess?.();
        } catch (err) {
          const e = err instanceof Error ? err : new Error("Delete failed");
          toast.error(e.message);
          onError?.(e);
        } finally {
          markEnd();
        }
        return;
      }

      // For non-modal actions, call the API
      markStart();

      try {
        await dispatch(actionId, files, params);
        onSuccess?.();
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Action failed");
        toast.error(error.message);
        onError?.(error);
      } finally {
        markEnd();
      }
    },
    [
      markStart,
      markEnd,
      onSuccess,
      onError,
      onOpenRenameModal,
      onOpenMoveModal,
      onOpenDetailsModal,
      onOpenWatermarkModal,
      onOpenOptimizeModal,
      onRestoreFile,
      onDeletePermanently,
    ],
  );

  return {
    executeAction,
    isExecuting,
    getSelectionBarActions,
    getQuickMenuActions,
  };
}

async function dispatch(
  actionId: FileActionId,
  files: EnhancedFileItem[],
  _params: ActionParams,
): Promise<void> {
  const ids = files.map((f) => f.id);

  switch (actionId) {
    case "preview":
      break;

    case "download":
      if (ids.length === 1) {
        await downloadSingleFile(ids[0], files[0].name);
        toast.success(`Downloading "${files[0].name}"`);
      } else {
        await downloadMultipleFiles(ids);
      }
      break;

    case "share":
      usePopupStore.getState().toggleSharingPopup();
      await apiShare(ids);
      toast.success(
        ids.length === 1
          ? `Shared "${files[0].name}"`
          : `Shared ${ids.length} items`,
      );
      break;

    case "getLink": {
      const link = await apiGetLink(ids[0]);
      if (link) await copyToClipboard(link, "Link copied to clipboard!");
      break;
    }

    case "duplicate":
      await apiDuplicate(ids);
      toast.success(
        ids.length === 1
          ? `Duplicated "${files[0].name}"`
          : `Duplicated ${ids.length} items`,
      );
      break;

    case "compress":
      await apiCompress(ids);
      // Toast is handled in apiCompress
      break;

    case "extract":
      await apiExtract(ids[0]);
      toast.success(`Extracting "${files[0].name}"`);
      break;

    case "lock":
      await apiLock(ids);
      toast.success(
        ids.length === 1
          ? `Locked "${files[0].name}"`
          : `Locked ${ids.length} items`,
      );
      break;

    case "unlock":
      await apiUnlock(ids);
      toast.success(
        ids.length === 1
          ? `Unlocked "${files[0].name}"`
          : `Unlocked ${ids.length} items`,
      );
      break;

    case "generatePdf":
      await apiGeneratePdf(ids);
      // Toast is handled in apiGeneratePdf
      break;

    case "star":
      await apiStar(ids);
      toast.success(
        ids.length === 1
          ? `Starred "${files[0].name}"`
          : `Starred ${ids.length} items`,
      );
      break;

    case "unstar":
      await apiUnstar(ids);
      toast.success(
        ids.length === 1
          ? `Unstarred "${files[0].name}"`
          : `Unstarred ${ids.length} items`,
      );
      break;

    case "delete":
      await apiDelete(ids);
      toast.success(
        ids.length === 1
          ? `"${files[0].name}" moved to trash`
          : `${ids.length} items moved to trash`,
      );
      break;

    case "deletePermanently":
      await apiDeletePermanently(ids);
      toast.success(
        ids.length === 1
          ? `"${files[0].name}" deleted permanently`
          : `${ids.length} items deleted permanently`,
      );
      break;

    case "restore":
      await apiRestore(ids);
      toast.success(
        ids.length === 1
          ? `"${files[0].name}" restored`
          : `${ids.length} items restored`,
      );
      break;

    default:
      throw new Error(`Unknown action: ${actionId}`);
  }
}

export type { UseFileActionsOptions };
