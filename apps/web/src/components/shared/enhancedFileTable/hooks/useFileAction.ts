import { useCallback } from "react";

import type {
  EnhancedFileItem,
  FileActionId,
  ActionListItem,
  UseFileActionsOptions,
  ActionParams,
} from "../types/fileActions";

import { getAvailableActions } from "../utils/fileActionRegistry";
import { useFileActionsStore } from "../store/useFileActionsStore";
import { toast } from "../../../../services/toast.service";

import {
  downloadSingleFile,
  downloadMultipleFiles,
  copyToClipboard,
  apiRename,
  apiDuplicate,
  apiMove,
  apiShare,
  apiGetLink,
  apiCompress,
  apiExtract,
  apiLock,
  apiUnlock,
  apiOptimize,
  apiWatermark,
  apiGeneratePdf,
  apiStar,
  apiUnstar,
  apiDelete,
  apiDeletePermanently,
  apiRestore,
} from "../utils/fileActions";

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

      // Handle modal actions - if no params provided, open modal instead of executing
      const hasParams = params && Object.keys(params).length > 0;

      if (!hasParams) {
        switch (actionId) {
          case "rename":
            onOpenRenameModal?.(files[0]);
            return;
            //case "move":
            //  onOpenMoveModal?.(files);
            return;
          case "details":
            onOpenDetailsModal?.(files[0]);
            return;
          case "watermark":
            onOpenWatermarkModal?.(files[0]);
            return;
          case "optimize":
            onOpenOptimizeModal?.(files[0]);
            return;
        }
      }

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
  params: ActionParams,
): Promise<void> {
  const ids = files.map((f) => f.id);

  switch (actionId) {
    case "rename":
      if (params.newName) {
        await apiRename(ids[0], params.newName as string);
        toast.success(`Renamed to "${params.newName}"`);
      }
      break;

    //case "move":
    // if (params.targetFolderPath !== undefined) {
    //  await apiMove(ids, params.targetFolderPath as string);
    ///  toast.success(
    //    ids.length === 1
    //      ? `Moved "${files[0].name}"`
    //      : `Moved ${ids.length} items`,
    //  );
    //}
    //break;

    case "details":
      // Details is view-only, no API call needed
      break;

    case "watermark":
      if (params.text !== undefined) {
        await apiWatermark(ids, {
          text: params.text as string,
          position: params.position as string,
          opacity: params.opacity as number,
        });
        toast.success("Watermark added successfully");
      }
      break;

    case "optimize":
      if (
        params.quality !== undefined ||
        params.format !== undefined ||
        params.maxWidth !== undefined
      ) {
        await apiOptimize(ids[0], {
          quality: params.quality as number,
          format: params.format as string,
          maxWidth: params.maxWidth as number,
        });
        toast.success("Image optimized successfully");
      }
      break;

    case "preview":
      // Preview is handled by UI, no API call
      break;

    case "download":
      if (ids.length === 1) {
        downloadSingleFile(ids[0], files[0].name);
        toast.success(`Downloading "${files[0].name}"`);
      } else {
        await downloadMultipleFiles(ids);
      }
      break;

    case "share":
      await apiShare(ids);
      toast.success(
        ids.length === 1
          ? `Shared "${files[0].name}"`
          : `Shared ${ids.length} items`,
      );
      break;

    case "getLink": {
      const link = await apiGetLink(ids[0]);
      await copyToClipboard(link, "Link copied to clipboard!");
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
      await apiCompress(ids, params.archiveName as string | undefined);
      break;

    case "extract":
      await apiExtract(ids[0], params.targetFolderPath as string | undefined);
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
      await apiGeneratePdf(
        ids,
        params.pdfOptions as Record<string, unknown> | undefined,
      );
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
