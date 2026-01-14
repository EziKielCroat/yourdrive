/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, type RefObject, useState } from "react";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import { usePopupPosition } from "../../hooks/usePopupPosition";

import { PopupIcon, PopupText } from "../styles/general";

import {
  PopupContainer,
  PopupItem,
} from "../../../dashboard/component/main/styles/filterPopup.styles";

import NewFolderIcon from "../../icons/newFolder";
import FileUploadIcon from "../../icons/fileUpload";
import UploadFolderIcon from "../../icons/uploadFolder";

import { useAuthStore } from "../../../../store/authStore";
import { useStorageStore } from "../../../../store/storageStore";

import UploadStatusModal from "./UploadStatusModal";

import { eventBus } from "../../../../events/eventBus";
import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";

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

  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as RefObject<HTMLElement>, closeUploadPopup);

  const handleNewFolder = () => {
    console.log("Create new folder...");
    closeUploadPopup();
  };

  const handleFileUploadClick = () => fileInputRef.current?.click();
  const handleFolderUploadClick = () => folderInputRef.current?.click();

  const options = [
    { icon: NewFolderIcon, text: "New Folder", onClick: handleNewFolder },
    {
      icon: FileUploadIcon,
      text: "Upload File",
      onClick: handleFileUploadClick,
    },
    {
      icon: UploadFolderIcon,
      text: "Upload Folder",
      onClick: handleFolderUploadClick,
    },
  ];

  const uploadToBackend = async (
    files: FileList,
    preserveStructure = false
  ) => {
    if (!files.length) return;

    const totalSize = Array.from(files).reduce(
      (sum, file) => sum + file.size,
      0
    );

    const { totalBytes, usedBytes } = useStorageStore.getState();
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
      status: "pending",
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
        folderPaths[index] = folderPath;
      }

      formData.append("files", file);
    });

    if (preserveStructure) {
      formData.append("folderPaths", JSON.stringify(folderPaths));
    }

    try {
      await new Promise((r) => setTimeout(r, 400));

      setUploadFiles((prev) =>
        prev.map((f) => ({ ...f, status: "uploading" }))
      );

      const response = await fetch("http://localhost:3000/api/files/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!response.ok)
        throw new Error(`Upload failed: ${response.statusText}`);

      const result = await response.json();

      setUploadFiles((prev) =>
        prev.map((f) => ({ ...f, status: "complete", progress: 100 }))
      );
      setTotalProgress(100);

      addUsage(totalSize);

      refreshStorage(accessToken).then(() => {
        eventBus.emit(FILES_REFRESH_EVENT);
      });

      return result;
    } catch (err) {
      console.error("Upload error:", err);

      setUploadFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error",
          error: "Upload failed",
        }))
      );
      throw err;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length)
      uploadToBackend(files, false).finally(() => (e.target.value = ""));
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length)
      uploadToBackend(files, true).finally(() => (e.target.value = ""));
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFiles([]);
    setTotalProgress(0);
  };

  if (!isOpen)
    return (
      <>
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
          // @ts-expect-error - webkitdirectory works
          webkitdirectory=""
          multiple
          onChange={handleFolderChange}
        />
      </>
    );

  return (
    <>
      <PopupContainer
        ref={popupRef}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          padding: "6px 0",
          display: "flex",
          flexDirection: "column",
          width: "210px",
        }}
      >
        {options.map(({ icon: Icon, text, onClick }) => (
          <PopupItem key={text} onClick={onClick}>
            <PopupIcon>
              <Icon color="#535355" />
            </PopupIcon>
            <PopupText>{text}</PopupText>
          </PopupItem>
        ))}
      </PopupContainer>

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
        // @ts-expect-error - supported
        webkitdirectory=""
        multiple
        onChange={handleFolderChange}
      />
    </>
  );
};

export default UploadPopup;
