import { useState, useEffect } from "react";
import { getFileTypeInfo } from "../filesPreview/utils/FileTypeDetector";
import api from "../../../lib/axios";

interface UseFileLoaderProps {
  fileId?: string;
  propUrl?: string;
  fileName: string;
  mimeType?: string;
  fileType?: string;
}

interface UseFileLoaderReturn {
  fileUrl: string;
  detectedType: string;
  loading: boolean;
  error: string | null;
}

export const useFileLoader = ({
  fileId,
  propUrl,
  fileName,
  mimeType,
  fileType,
}: UseFileLoaderProps): UseFileLoaderReturn => {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [detectedType, setDetectedType] = useState<string>("unsupported");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Detect file type from fileName and mimeType
        const info = getFileTypeInfo(fileName, mimeType);
        const type = fileType || info.type;
        setDetectedType(type);

        // If propUrl is provided, use it directly
        if (propUrl) {
          console.log("Using propUrl:", propUrl);
          setFileUrl(propUrl);
          setLoading(false);
          return;
        }

        // If fileId is provided, fetch the signed URL
        if (fileId) {
          console.log("Fetching file with ID:", fileId);

          const response = await api.get(`/files/content/${fileId}`);

          const data = response.data;
          console.log("API response data:", data);

          if (!data.signedUrl && !data.url) {
            throw new Error("No signed URL or URL returned from API");
          }

          const url = data.signedUrl || data.url;
          console.log("Setting file URL:", url);
          setFileUrl(url);
          setLoading(false);
          return;
        }

        throw new Error("No file URL or file ID provided");
      } catch (err) {
        console.error("Error loading file:", err);
        setError(err instanceof Error ? err.message : "Failed to load file");
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId, propUrl, fileName, mimeType, fileType]);

  return {
    fileUrl,
    detectedType,
    loading,
    error,
  };
};
