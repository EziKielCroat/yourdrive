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

interface UploadPopupProps {
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ anchorRef }) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isOpen = usePopupStore((s) => s.isUploadPopupOpen);
  const closeUploadPopup = usePopupStore((s) => s.closeUploadPopup);

  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [uploading, setUploading] = useState(false);

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
      setUploading(true);
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      if (!response.ok)
        throw new Error(`Upload failed: ${response.statusText}`);
      const result = await response.json();
      console.log("Upload successful:", result);
      return result;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
      closeUploadPopup();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      console.log("Uploading file:", files[0].name);
      await uploadToBackend(files, false);
      console.log("File uploaded successfully");
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
      console.log(`Uploading folder with ${files.length} files`);
      Array.from(files).forEach((file) => {
        console.log("File path:", (file as any).webkitRelativePath);
      });
      await uploadToBackend(files, true);
      console.log("Folder uploaded successfully");
    } catch (err) {
      console.error("Failed to upload folder:", err);
    } finally {
      e.target.value = "";
    }
  };

  if (!isOpen) return null;

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
          {uploading && <PopupText>Uploading…</PopupText>}
        </PopupWrapper>
      </PopupPortal>

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
