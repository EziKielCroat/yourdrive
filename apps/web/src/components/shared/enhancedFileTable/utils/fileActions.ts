import api from "../../../../lib/axios";
import { toast } from "../../../../services/toast.service";

interface BatchResult<T = unknown> {
  success: boolean;
  data?: T[];
  error?: string;
}

async function safeToast(
  toastFn: () => void,
  fallbackMessage?: string,
): Promise<void> {
  try {
    if (toast["callbacks"] && toast["callbacks"].length > 0) {
      toastFn();
    } else {
      console.log("Toast system not ready, queuing...");

      const startTime = Date.now();
      const maxWait = 3000;

      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (toast["callbacks"] && toast["callbacks"].length > 0) {
            clearInterval(checkInterval);
            toastFn();
            resolve();
          } else if (Date.now() - startTime > maxWait) {
            clearInterval(checkInterval);
            if (fallbackMessage) {
              console.log("Toast (not displayed):", fallbackMessage);
            }
            resolve();
          }
        }, 100);
      });
    }
  } catch (error) {
    console.error("Toast error:", error);
    if (fallbackMessage) {
      console.log("Fallback:", fallbackMessage);
    }
  }
}

async function showSuccessToast(message: string): Promise<void> {
  await safeToast(() => toast.success(message), message);
}

async function showErrorToast(message: string): Promise<void> {
  await safeToast(() => toast.error(message), message);
}

export async function executeBatchOperation<T = unknown>(
  fileIds: string[],
  operation: string,
  params: Record<string, unknown> = {},
  onProgress?: (progress: number) => void,
): Promise<BatchResult<T>> {
  try {
    onProgress?.(0);

    const BATCH_SIZE = 10;
    const results: T[] = [];

    for (let i = 0; i < fileIds.length; i += BATCH_SIZE) {
      const batch = fileIds.slice(i, i + BATCH_SIZE);

      onProgress?.(Math.round((i / fileIds.length) * 100));

      const response = await api.post<T[]>(`/file-actions/${operation}/batch`, {
        fileIds: batch,
        ...params,
      });

      results.push(...response.data);

      if (i + BATCH_SIZE < fileIds.length) {
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
      }
    }

    onProgress?.(100);
    return { success: true, data: results };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Batch operation failed";
    await showErrorToast(`Batch operation failed: ${message}`);
    return { success: false, error: message };
  }
}

export function downloadSingleFile(fileId: string, fileName: string): void {
  api
    .get(`/file-actions/download/${fileId}`)
    .then((response) => {
      const link = document.createElement("a");
      link.href = response.data.downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      safeToast(
        () => toast.success(`Downloading ${fileName}`),
        `Downloading ${fileName}`,
      );
    })
    .catch(async (error) => {
      const message =
        error instanceof Error ? error.message : "Download failed";
      await showErrorToast(`Download failed: ${message}`);
    });
}

export async function downloadMultipleFiles(
  fileIds: string[],
  archiveName = "archive.zip",
): Promise<void> {
  try {
    const response = await api.post<{
      success: boolean;
      downloadUrl: string;
      fileName: string;
    }>("/file-actions/download", { fileIds });

    if (response.data.success && response.data.downloadUrl) {
      const link = document.createElement("a");
      link.href = response.data.downloadUrl;
      link.download = response.data.fileName || archiveName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await showSuccessToast("Download started");
    } else {
      await showErrorToast("Download failed: No download URL received");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Download failed";
    await showErrorToast(`Download failed: ${message}`);
  }
}

export async function copyToClipboard(
  text: string,
  successMessage = "Copied to clipboard!",
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    await showSuccessToast(successMessage);
  } catch {
    await showErrorToast("Failed to copy to clipboard");
  }
}

// Rename - PATCH method
export async function apiRename(
  fileId: string,
  newName: string,
): Promise<boolean> {
  try {
    await api.patch(`/file-actions/rename/${fileId}`, { newName });
    await showSuccessToast("File renamed successfully");
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Rename failed";
    await showErrorToast(`Rename failed: ${message}`);
    return false;
  }
}

// Duplicate - supports batch (array of fileIds)
export async function apiDuplicate(fileIds: string[]): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/duplicate", { fileIds });
    if (response.data.success) {
      await showSuccessToast(
        `${response.data.data?.length || fileIds.length} file(s) duplicated`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Duplication failed");
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Duplication failed";
    await showErrorToast(`Duplication failed: ${message}`);
    return false;
  }
}

// Move - batch operation
export async function apiMove(
  fileIds: string[],
  targetFolderPath: string,
): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/move", {
      fileIds,
      targetFolderPath,
    });
    if (response.data.success) {
      await showSuccessToast(
        `${response.data.data?.movedCount || fileIds.length} file(s) moved`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Move failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Move failed";
    await showErrorToast(`Move failed: ${message}`);
    return false;
  }
}

// Share - batch operation
export async function apiShare(fileIds: string[]): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/share", { fileIds });
    if (response.data.success) {
      await showSuccessToast(`${fileIds.length} file(s) shared`);
      return true;
    } else {
      await showErrorToast(response.data.error || "Share failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Share failed";
    await showErrorToast(`Share failed: ${message}`);
    return false;
  }
}

// Get link - GET method
export async function apiGetLink(fileId: string): Promise<string | null> {
  try {
    const res = await api.get<{ link: string }>(
      `/file-actions/get-link/${fileId}`,
    );
    return res.data.link;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to get link";
    await showErrorToast(`Failed to get link: ${message}`);
    return null;
  }
}

// Compress - creates archive and triggers download
export async function apiCompress(
  fileIds: string[],
  archiveName?: string,
): Promise<boolean> {
  try {
    const res = await api.post<{
      success: boolean;
      downloadUrl: string;
      fileName: string;
      message?: string;
    }>("/file-actions/compress", { fileIds, archiveName });

    if (res.data.success && res.data.downloadUrl) {
      const link = document.createElement("a");
      link.href = res.data.downloadUrl;
      link.download = res.data.fileName || "archive.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await showSuccessToast(
        res.data.message || "Archive created successfully",
      );
      return true;
    } else {
      await showErrorToast(res.data.message || "Compression failed");
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Compression failed";
    await showErrorToast(`Compression failed: ${message}`);
    return false;
  }
}

// Extract - single fileId in body
export async function apiExtract(
  fileId: string,
  targetFolderPath?: string,
): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/extract", {
      fileId,
      targetFolderPath,
    });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message ||
          `Extracted ${response.data.data?.extractedCount || 0} file(s)`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Extraction failed");
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Extraction failed";
    await showErrorToast(`Extraction failed: ${message}`);
    return false;
  }
}

// Lock - returns updated file state
export async function apiLock(fileIds: string[]): Promise<{
  success: boolean;
  data?: { files: Array<{ id: string; is_locked: boolean }> };
  error?: string;
}> {
  try {
    const res = await api.post<{
      success: boolean;
      data: { files: Array<{ id: string; is_locked: boolean }> };
      message?: string;
    }>("/file-actions/lock", { fileIds });

    if (res.data.success) {
      await showSuccessToast(
        res.data.message || `${fileIds.length} file(s) locked`,
      );
    }

    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lock failed";
    await showErrorToast(`Lock failed: ${message}`);
    return { success: false, error: message };
  }
}

// Unlock - returns updated file state
export async function apiUnlock(fileIds: string[]): Promise<{
  success: boolean;
  data?: { files: Array<{ id: string; is_locked: boolean }> };
  error?: string;
}> {
  try {
    const res = await api.post<{
      success: boolean;
      data: { files: Array<{ id: string; is_locked: boolean }> };
      message?: string;
    }>("/file-actions/unlock", { fileIds });

    if (res.data.success) {
      await showSuccessToast(
        res.data.message || `${fileIds.length} file(s) unlocked`,
      );
    }

    return res.data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unlock failed";
    await showErrorToast(`Unlock failed: ${message}`);
    return { success: false, error: message };
  }
}

// Optimize - single file
export async function apiOptimize(
  fileId: string,
  options: { quality?: number; format?: string; maxWidth?: number } = {},
): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/optimize", {
      fileId,
      ...options,
    });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message || "Image optimized successfully",
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Optimization failed");
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Optimization failed";
    await showErrorToast(`Optimization failed: ${message}`);
    return false;
  }
}

// Watermark - batch operation
export async function apiWatermark(
  fileIds: string[],
  options: { text?: string; position?: string; opacity?: number } = {},
): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/watermark", {
      fileIds,
      ...options,
    });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message || "Watermark added successfully",
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Watermark failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Watermark failed";
    await showErrorToast(`Watermark failed: ${message}`);
    return false;
  }
}

// Generate PDF - creates PDF and triggers download
export async function apiGeneratePdf(
  fileIds: string[],
  options: Record<string, unknown> = {},
): Promise<boolean> {
  try {
    const res = await api.post<{
      success: boolean;
      downloadUrl: string;
      fileName: string;
      message?: string;
    }>("/file-actions/generate-pdf", { fileIds, options });

    if (res.data.success && res.data.downloadUrl) {
      const link = document.createElement("a");
      link.href = res.data.downloadUrl;
      link.download = res.data.fileName || "generated.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await showSuccessToast(res.data.message || "PDF generated successfully");
      return true;
    } else {
      await showErrorToast(res.data.message || "PDF generation failed");
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "PDF generation failed";
    await showErrorToast(`PDF generation failed: ${message}`);
    return false;
  }
}

// Star - batch operation
export async function apiStar(fileIds: string[]): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/star", { fileIds });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message || `${fileIds.length} file(s) starred`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Star failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Star failed";
    await showErrorToast(`Star failed: ${message}`);
    return false;
  }
}

// Unstar - batch operation
export async function apiUnstar(fileIds: string[]): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/unstar", { fileIds });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message ||
          `${response.data.data?.unstarredIds?.length || fileIds.length} file(s) unstarred`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Unstar failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unstar failed";
    await showErrorToast(`Unstar failed: ${message}`);
    return false;
  }
}

// Delete (soft) - batch operation using proper recycle bin logic
export async function apiDelete(fileIds: string[]): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/delete", { fileIds });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message ||
          `${response.data.data?.deletedIds?.length || fileIds.length} file(s) moved to recycle bin`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Delete failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    await showErrorToast(`Delete failed: ${message}`);
    return false;
  }
}

// Delete permanently - batch operation
export async function apiDeletePermanently(
  fileIds: string[],
): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/delete-permanently", {
      fileIds,
    });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message ||
          `${fileIds.length} file(s) permanently deleted`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Permanent delete failed");
      return false;
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Permanent delete failed";
    await showErrorToast(`Permanent delete failed: ${message}`);
    return false;
  }
}

// Restore - batch operation
export async function apiRestore(fileIds: string[]): Promise<boolean> {
  try {
    const response = await api.post("/file-actions/restore", { fileIds });
    if (response.data.success) {
      await showSuccessToast(
        response.data.message ||
          `${response.data.data?.restoredIds?.length || fileIds.length} file(s) restored`,
      );
      return true;
    } else {
      await showErrorToast(response.data.error || "Restore failed");
      return false;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Restore failed";
    await showErrorToast(`Restore failed: ${message}`);
    return false;
  }
}
