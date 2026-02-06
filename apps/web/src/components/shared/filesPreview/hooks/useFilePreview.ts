import { useCallback, useEffect, useMemo, useState } from "react";
import { getFileTypeInfo } from "../utils/FileTypeDetector";
import api from "../../../../lib/axios";

function formatMetaDate(value: string): string {
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  } catch {
    return value;
  }
}

interface UseFilePreviewArgs {
  fileId?: string;
  url?: string;
  fileName: string;
  mimeType?: string;
  options?: {
    generateThumbnail?: boolean;
    extractMetadata?: boolean;
    maxSize?: number;
  };
}

interface UseFilePreviewReturn {
  previewUrl: string;
  previewCategory:
    | "image"
    | "video"
    | "audio"
    | "pdf"
    | "spreadsheet"
    | "text"
    | "code"
    | "document"
    | "office"
    | "archive"
    | "default";
  isLoading: boolean;
  error: string | null;
  metadata: Record<string, unknown> | null;
  refreshPreview: () => void;
}

export function useFilePreview({
  fileId,
  url,
  fileName,
  mimeType,
}: UseFilePreviewArgs): UseFilePreviewReturn {
  const fileTypeInfo = useMemo(
    () => getFileTypeInfo(fileName, mimeType),
    [fileName, mimeType],
  );

  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshPreview = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If URL was provided (e.g. shared link), use it as-is.
        if (url) {
          setPreviewUrl(url);
          setMetadata(null);
          setIsLoading(false);
          return;
        }

        if (!fileId) {
          throw new Error("No file ID provided");
        }

        // Fetch-based previews that should stay same-origin (avoid CORS when reading bytes)
        // use the authenticated blob endpoint.
        const needsAuthenticatedBlob =
          fileTypeInfo.previewCategory === "text" ||
          fileTypeInfo.previewCategory === "code" ||
          fileTypeInfo.previewCategory === "spreadsheet" ||
          fileTypeInfo.previewCategory === "document" ||
          fileTypeInfo.previewCategory === "archive";

        if (needsAuthenticatedBlob) {
          setPreviewUrl(`/files/blob/${fileId}`);
          try {
            const metaRes = await api.get(`/files/content/${fileId}`);
            const d = metaRes.data;
            const meta: Record<string, unknown> = {};
            if (d?.created_at) meta.created = formatMetaDate(d.created_at);
            if (d?.updated_at) meta.modified = formatMetaDate(d.updated_at);
            setMetadata(Object.keys(meta).length ? meta : null);
          } catch {
            setMetadata(null);
          }
          setIsLoading(false);
          return;
        }

        // Media/iframe previews should use signed URL (no auth headers required)
        const response = await api.get(`/files/content/${fileId}`);
        const data = response.data;
        if (!data?.signedUrl && !data?.url) {
          throw new Error("No URL returned from API");
        }

        setPreviewUrl(data.signedUrl || data.url);
        const meta: Record<string, unknown> = {};
        if (data.created_at) meta.created = formatMetaDate(data.created_at);
        if (data.updated_at) meta.modified = formatMetaDate(data.updated_at);
        setMetadata(Object.keys(meta).length ? meta : null);
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load preview");
        setPreviewUrl("");
        setMetadata(null);
        setIsLoading(false);
      }
    };

    load();
  }, [fileId, url, fileName, mimeType, refreshKey, fileTypeInfo]);

  return {
    previewUrl,
    previewCategory: fileTypeInfo.previewCategory,
    isLoading,
    error,
    metadata,
    refreshPreview,
  };
}

