import api from "./axios";
import computeSHA256 from "../components/shared/utils/computeSHA256";

/** Align with UppyUploadPopup / API multer limits */
export const DIRECT_UPLOAD_THRESHOLD = 50 * 1024 * 1024;
export const CHUNK_SIZE = 5 * 1024 * 1024;
export const MAX_CONCURRENT_CHUNKS = 6;
export const MAX_RETRIES = 3;

export function getUploadErrorMessage(error: unknown): string {
  const err = error as {
    response?: { status?: number; data?: { error?: string; details?: string } };
    message?: string;
  };
  if (err?.response?.status === 413) {
    return "Upload blocked: request too large for the server proxy. If this persists after an update, contact support.";
  }
  if (err?.response?.data?.error) return String(err.response.data.error);
  if (err?.response?.data?.details) return String(err.response.data.details);
  if (typeof err?.message === "string") return err.message;
  return "Upload failed";
}

export interface UploadSingleOptions {
  folderPath?: string;
  signal?: AbortSignal;
  onMultipartProgress?: (loaded: number, total: number) => void;
  onDirectProgress?: (loaded: number, total: number) => void;
}

/**
 * Upload one file using direct POST or multipart, matching UppyUploadPopup behavior.
 */
export async function uploadSingleDashboardFile(
  file: File,
  options: UploadSingleOptions = {},
): Promise<void> {
  const folderPath = options.folderPath ?? "";
  if (file.size < DIRECT_UPLOAD_THRESHOLD) {
    await uploadDirect(file, folderPath, options);
    return;
  }
  await uploadMultipart(file, folderPath, options);
}

async function uploadDirect(
  file: File,
  folderPath: string,
  options: UploadSingleOptions,
): Promise<void> {
  const formData = new FormData();
  formData.append("files", file);
  if (folderPath) {
    formData.append("folderPaths", JSON.stringify({ 0: folderPath }));
  }
  await api.post("/files/upload", formData, {
    signal: options.signal,
    onUploadProgress: (progressEvent) => {
      if (
        progressEvent.total &&
        options.onDirectProgress &&
        progressEvent.loaded != null
      ) {
        options.onDirectProgress(progressEvent.loaded, progressEvent.total);
      }
    },
  });
}

async function uploadMultipart(
  file: File,
  folderPath: string,
  options: UploadSingleOptions,
): Promise<void> {
  const fileHash = await computeSHA256(file);
  const initResponse = await api.post(
    "/files/init-multipart-upload",
    {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      folderPath,
      fileHash,
    },
    { signal: options.signal },
  );

  const initData = initResponse.data as {
    duplicate?: boolean;
    uploadId?: string;
    s3Key?: string;
  };

  if (initData.duplicate) {
    options.onMultipartProgress?.(file.size, file.size);
    return;
  }
  if (!initData.uploadId || !initData.s3Key) {
    throw new Error("Invalid response from server");
  }

  const { uploadId, s3Key } = initData;
  const totalParts = Math.ceil(file.size / CHUNK_SIZE);
  const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];
  let uploadedBytes = 0;

  const uploadPart = async (
    partNumber: number,
    retryCount = 0,
  ): Promise<void> => {
    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("uploadId", uploadId);
    formData.append("s3Key", s3Key);
    formData.append("partNumber", partNumber.toString());

    try {
      const uploadResponse = await api.post("/files/upload-chunk", formData, {
        signal: options.signal,
      });
      const { ETag } = uploadResponse.data as { ETag: string };
      uploadedParts.push({
        PartNumber: partNumber,
        ETag: String(ETag).replace(/"/g, ""),
      });
      uploadedBytes += chunk.size;
      options.onMultipartProgress?.(uploadedBytes, file.size);
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err?.name === "AbortError") throw error;
      if (retryCount < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, retryCount)),
        );
        return uploadPart(partNumber, retryCount + 1);
      }
      throw error;
    }
  };

  for (let i = 0; i < totalParts; i += MAX_CONCURRENT_CHUNKS) {
    const batch: Promise<void>[] = [];
    for (let j = 0; j < MAX_CONCURRENT_CHUNKS && i + j < totalParts; j++) {
      batch.push(uploadPart(i + j + 1));
    }
    await Promise.all(batch);
  }

  await api.post(
    "/files/complete-multipart-upload",
    {
      uploadId,
      s3Key,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      folderPath,
      fileHash,
      parts: uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber),
    },
    { signal: options.signal },
  );
}

/**
 * Upload a list of files (e.g. drag-drop) using the correct strategy per file.
 */
export async function uploadDashboardFileList(
  fileList: FileList | File[],
  getFolderPath: (file: File, index: number) => string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const files = Array.from(fileList);
  for (let i = 0; i < files.length; i++) {
    await uploadSingleDashboardFile(files[i], {
      folderPath: getFolderPath(files[i], i),
      signal: options?.signal,
    });
  }
}
