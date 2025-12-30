/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import PopupPortal from "../../Portal/Portal";
import {
  PopupIcon,
  PopupItems,
  PopupText,
  PopupWrapper,
} from "../styles/general";

import UploadFolderIcon from "../../icons/uploadFolder";
import NewFolderIcon from "../../icons/newFolder";
import FileUploadIcon from "../../icons/FileUpload";
import { useAuthStore } from "../../../../store/authStore";
import { useStorageStore } from "../../../../store/storageStore";
import UploadStatusModal from "./UploadStatusModal";

interface UploadPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

interface UploadFile {
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ anchorRef }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const addUsage = useStorageStore((s) => s.addUsage);
  const refreshStorage = useStorageStore((s) => s.refreshStorage);

  const isOpen = usePopupStore((s) => s.isUploadPopupOpen);
  const closeUploadPopup = usePopupStore((s) => s.closeUploadPopup);

  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }
  }, [isOpen, anchorRef]);

  useClickOutside(popupRef as RefObject<HTMLElement>, closeUploadPopup);

  const handleNewFolder = () => {
    console.log("Create new folder…");
    closeUploadPopup();
  };

  const handleFileUploadClick = () => fileInputRef.current?.click();
  const handleFolderUploadClick = () => folderInputRef.current?.click();

  const uploadToBackend = async (
    files: FileList,
    preserveStructure = false
  ) => {
    if (!files.length) return;

    const totalSize = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );

    const totalBytes = useStorageStore.getState().totalBytes;
    const usedBytes = useStorageStore.getState().usedBytes;
    const availableBytes = totalBytes - usedBytes;

    if (totalSize > availableBytes) {
      alert(
        `Not enough storage space. You need ${formatBytes(
          totalSize
        )} but only have ${formatBytes(availableBytes)} available.`
      );
      return;
    }

    closeUploadPopup();

    const uploadFilesList: UploadFile[] = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadFiles(uploadFilesList);
    setShowUploadModal(true);
    setTotalProgress(0);

    const formData = new FormData();
    const folderPaths: Record<string, string> = {};

    Array.from(files).forEach((file, index) => {
      const relativePath = (file as any).webkitRelativePath || "";

      if (preserveStructure && relativePath) {
        const folderPath =
          relativePath.substring(0, relativePath.lastIndexOf("/")) || "";
        folderPaths[index.toString()] = folderPath;
      }

      formData.append("files", file);
    });

    if (preserveStructure) {
      formData.append("folderPaths", JSON.stringify(folderPaths));
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUploadFiles((prev) =>
        prev.map((f) => ({ ...f, status: "uploading" as const }))
      );

      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      setUploadFiles((prev) =>
        prev.map((f) => ({ ...f, status: "complete" as const, progress: 100 }))
      );
      setTotalProgress(100);

      addUsage(totalSize);

      // TODO: Refresh storage and trigger app-wide refresh (in background)
      refreshStorage(accessToken).then(() => {
        window.dispatchEvent(new CustomEvent("files-updated"));
      });

      return result;
    } catch (error) {
      console.error("Upload error:", error);

      setUploadFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          error: "Upload failed",
        }))
      );

      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      await uploadToBackend(files, false);
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      await uploadToBackend(files, true);
    } catch (err) {
      console.error("Failed to upload folder:", err);
    } finally {
      e.target.value = "";
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFiles([]);
    setTotalProgress(0);
  };

  console.log("UploadPopup render:", {
    showUploadModal,
    filesCount: uploadFiles.length,
  });

  const uploadOptions = [
    { icon: NewFolderIcon, text: "New Map", onClick: handleNewFolder },
    {
      icon: FileUploadIcon,
      text: "File Upload",
      onClick: handleFileUploadClick,
    },
    {
      icon: UploadFolderIcon,
      text: "Folder Upload",
      onClick: handleFolderUploadClick,
    },
  ];

  return (
    <>
      {isOpen && (
        <PopupPortal>
          <PopupWrapper
            ref={popupRef}
            style={{ top: coords.top, left: coords.left }}
          >
            {uploadOptions.map(({ icon: Icon, text, onClick }, i) => (
              <PopupItems key={i} tabIndex={0} onClick={onClick}>
                <PopupIcon>
                  <Icon color="#535355" />
                </PopupIcon>
                <PopupText>{text}</PopupText>
              </PopupItems>
            ))}
          </PopupWrapper>
        </PopupPortal>
      )}

      <UploadStatusModal
        isOpen={showUploadModal}
        files={uploadFiles}
        onClose={handleCloseUploadModal}
        totalProgress={totalProgress}
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <input
        type="file"
        ref={folderInputRef}
        style={{ display: "none" }}
        // @ts-expect-error - webkitdirectory works in all browsers
        webkitdirectory=""
        multiple
        onChange={handleFolderChange}
      />
    </>
  );
};

export default UploadPopup;
