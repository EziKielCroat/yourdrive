import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../../lib/axios";

interface FormatMap {
  [key: string]: string[];
}

const formatMap: FormatMap = {
  "application/pdf": ["docx", "txt", "html"],
  "text/plain": ["pdf", "docx", "html"],
  "image/png": ["jpg", "webp", "jpeg"],
  "image/jpeg": ["png", "webp"],
};

export const useFileConversion = () => {
  const [formats, setFormats] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);

  const loadFormats = (mimeType: string) => {
    const allowed = formatMap[mimeType] || [];
    setFormats(allowed);
  };

  const prepareFile = async (fileId: string) => {
    const response = await api.get(`/conversion/prepare/${fileId}`);
    return response.data;
  };

  const convertFile = async (
    fileId: string,
    fileName: string,
    targetFormat: string,
  ) => {
    setConverting(true);

    try {
      const { downloadUrl, fileName: originalName } = await prepareFile(fileId);

      const vertUrl = new URL(import.meta.env.VITE_VERT_URL);
      vertUrl.searchParams.set("file", downloadUrl);
      vertUrl.searchParams.set("filename", originalName);
      vertUrl.searchParams.set("target", targetFormat);

      const callbackUrl = `${window.location.origin}/api/conversion/save`;
      vertUrl.searchParams.set("callback", callbackUrl);

      const width = 1200,
        height = 800;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const win = window.open(
        vertUrl.toString(),
        "vert-conversion",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
      );

      if (!win) throw new Error("Please allow popups");

      toast.success(
        "Conversion window opened. Follow instructions to convert your file.",
      );
    } catch (err: any) {
      console.error("Conversion error:", err);
      toast.error(err.message || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const saveConvertedFile = async (
    originalFileId: string,
    convertedFileUrl: string,
    fileName: string,
    newFormat: string,
  ) => {
    const response = await api.post("/conversion/save", {
      originalFileId,
      convertedFileUrl,
      fileName,
      newFormat,
    });

    return response.data;
  };

  return {
    formats,
    loadFormats,
    converting,
    prepareFile,
    convertFile,
    saveConvertedFile,
  };
};
