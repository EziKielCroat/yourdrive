import { useRef, type RefObject, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import { usePopupPosition } from "../../hooks/usePopupPosition";
import { eventBus } from "../../../../events/eventBus";
import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";
import api from "../../../../lib/axios";
import { toast } from "../../../../services/toast.service";

import { PopupIcon, PopupText } from "../styles/general";
import {
  PopupContainer,
  PopupItem,
} from "../../../dashboard/component/main/styles/filterPopup.styles";

import NewFolderIcon from "../../icons/newFolder";
import FileUploadIcon from "../../icons/fileUpload";
import UploadFolderIcon from "../../icons/uploadFolder";

import UppyUploadPopup from "./UppyUploadPopup";

interface UploadPopupProps {
  anchorRefDesktop: React.RefObject<HTMLButtonElement | null> | null;
  anchorRefMobile: React.RefObject<HTMLButtonElement | null> | null;
}

const UploadPopup: React.FC<UploadPopupProps> = ({
  anchorRefDesktop,
  anchorRefMobile,
}) => {
  const isOpen = usePopupStore((s) => s.isUploadPopupOpen);
  const closeUploadPopup = usePopupStore((s) => s.closeUploadPopup);

  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [_uploadMode, setUploadMode] = useState<"file" | "folder">("file");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [selectedFilesArray, setSelectedFilesArray] = useState<File[]>([]);

  const [isMobile, setIsMobile] = useState(false);
  const [activeAnchorRef, setActiveAnchorRef] =
    useState<React.RefObject<HTMLButtonElement | null> | null>(
      anchorRefDesktop,
    );

  // Determine which ref to use based on screen size and visibility
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile) {
        // Check if mobile button is visible
        if (anchorRefMobile?.current) {
          const rect = anchorRefMobile.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setActiveAnchorRef(anchorRefMobile);
            return;
          }
        }
        // Fallback to desktop if mobile not visible
        setActiveAnchorRef(anchorRefDesktop);
      } else {
        // Check if desktop button is visible
        if (anchorRefDesktop?.current) {
          const rect = anchorRefDesktop.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setActiveAnchorRef(anchorRefDesktop);
            return;
          }
        }
        // Fallback to mobile if desktop not visible
        setActiveAnchorRef(anchorRefMobile);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [anchorRefDesktop, anchorRefMobile]);

  const position = usePopupPosition({
    isOpen,
    anchorRef: activeAnchorRef,
    popupRef,
    placement: isMobile ? "bottom-right" : "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as RefObject<HTMLElement>, closeUploadPopup);

  const handleNewFolder = () => {
    setShowNewFolderModal(true);
    closeUploadPopup();
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      await api.post("/files/folders/create", {
        folderPath: folderName.trim(),
      });

      eventBus.emit(FILES_REFRESH_EVENT);
      setShowNewFolderModal(false);
      setFolderName("");
      toast.success("Folder created");
    } catch (error: unknown) {
      console.error("Error creating folder:", error);
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to create folder. Please try again.";
      toast.error(msg);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFileUploadClick = () => {
    closeUploadPopup();
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleFolderUploadClick = () => {
    closeUploadPopup();
    setTimeout(() => folderInputRef.current?.click(), 100);
  };

  const handleFileSelect = (
    files: FileList | null,
    mode: "file" | "folder",
  ) => {
    if (!files || files.length === 0) return;
    // Convert FileList to Array immediately to prevent it from becoming invalid on mobile
    const filesArray = Array.from(files);
    setUploadMode(mode);
    setSelectedFiles(files);
    setSelectedFilesArray(filesArray);
    setShowUploadModal(true);
  };

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

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFiles(null);
    setSelectedFilesArray([]);
    // Reset file inputs to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  if (!isOpen)
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files, "file")}
          style={{ display: "none" }}
        />
        <input
          ref={folderInputRef}
          type="file"
          /* @ts-expect-error - webkitdirectory is valid */
          webkitdirectory=""
          directory=""
          multiple
          onChange={(e) => handleFileSelect(e.target.files, "folder")}
          style={{ display: "none" }}
        />
        <UppyUploadPopup
          isOpen={showUploadModal}
          onClose={handleCloseUploadModal}
          preSelectedFiles={selectedFiles}
          preSelectedFilesArray={selectedFilesArray}
        />
        {showNewFolderModal && (
          <ModalOverlay
            onClick={() => !isCreatingFolder && setShowNewFolderModal(false)}
          >
            <FolderModal onClick={(e) => e.stopPropagation()}>
              <FolderModalHeader>New Folder</FolderModalHeader>
              <FolderModalBody>
                <FolderInput
                  type="text"
                  placeholder="Folder name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  autoFocus
                  disabled={isCreatingFolder}
                />
              </FolderModalBody>
              <FolderModalFooter>
                <FolderButton
                  onClick={() => setShowNewFolderModal(false)}
                  disabled={isCreatingFolder}
                >
                  Cancel
                </FolderButton>
                <FolderButton
                  $primary
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim() || isCreatingFolder}
                >
                  {isCreatingFolder ? "Creating..." : "Create"}
                </FolderButton>
              </FolderModalFooter>
            </FolderModal>
          </ModalOverlay>
        )}
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

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, "file")}
        style={{ display: "none" }}
      />
      <input
        ref={folderInputRef}
        type="file"
        /* @ts-expect-error - webkitdirectory is valid */
        webkitdirectory=""
        directory=""
        multiple
        onChange={(e) => handleFileSelect(e.target.files, "folder")}
        style={{ display: "none" }}
      />

      <UppyUploadPopup
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        preSelectedFiles={selectedFiles}
        preSelectedFilesArray={selectedFilesArray}
      />

      {showNewFolderModal && (
        <ModalOverlay
          onClick={() => !isCreatingFolder && setShowNewFolderModal(false)}
        >
          <FolderModal onClick={(e) => e.stopPropagation()}>
            <FolderModalHeader>New Folder</FolderModalHeader>
            <FolderModalBody>
              <FolderInput
                type="text"
                placeholder="Folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
                disabled={isCreatingFolder}
              />
            </FolderModalBody>
            <FolderModalFooter>
              <FolderButton
                onClick={() => setShowNewFolderModal(false)}
                disabled={isCreatingFolder}
              >
                Cancel
              </FolderButton>
              <FolderButton
                $primary
                onClick={handleCreateFolder}
                disabled={!folderName.trim() || isCreatingFolder}
              >
                {isCreatingFolder ? "Creating..." : "Create"}
              </FolderButton>
            </FolderModalFooter>
          </FolderModal>
        </ModalOverlay>
      )}
    </>
  );
};

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.2s ease-out;
`;

const FolderModal = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  animation: ${slideUp} 0.2s ease-out;
`;

const FolderModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e8eaed;
  font-size: 18px;
  font-weight: 500;
  color: #202124;
`;

const FolderModalBody = styled.div`
  padding: 24px;
`;

const FolderInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-size: 14px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  color: #202124;
  background: #fff;
  transition: all 0.15s;

  &::placeholder {
    color: #80868b;
  }

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    color: #80868b;
    cursor: not-allowed;
  }
`;

const FolderModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e8eaed;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const FolderButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: ${(props) => (props.$primary ? "none" : "1px solid #dadce0")};
  background: ${(props) => (props.$primary ? "#1a73e8" : "transparent")};
  color: ${(props) => (props.$primary ? "#fff" : "#5f6368")};

  &:hover:not(:disabled) {
    background: ${(props) => (props.$primary ? "#1765cc" : "#f8f9fa")};
    color: ${(props) => (props.$primary ? "#fff" : "#202124")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default UploadPopup;
