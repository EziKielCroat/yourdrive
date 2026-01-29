import { useRef, type RefObject, useState } from "react";
import styled, { keyframes } from "styled-components";
import { usePopupStore } from "../popup.store";
import { useClickOutside } from "../../hooks/useOutsideClick";
import { usePopupPosition } from "../../hooks/usePopupPosition";
import { useAuthStore } from "../../../../store/authStore";
import { eventBus } from "../../../../events/eventBus";
import { FILES_REFRESH_EVENT } from "../../../../events/fileEvents";

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
  anchorRef: React.RefObject<HTMLButtonElement | null> | null;
}

const UploadPopup: React.FC<UploadPopupProps> = ({ anchorRef }) => {
  const isOpen = usePopupStore((s) => s.isUploadPopupOpen);
  const closeUploadPopup = usePopupStore((s) => s.closeUploadPopup);
  const accessToken = useAuthStore((s) => s.accessToken);

  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "folder">("file");

  const position = usePopupPosition({
    isOpen,
    anchorRef,
    popupRef,
    placement: "bottom-left",
    offset: 8,
  });

  useClickOutside(popupRef as RefObject<HTMLElement>, closeUploadPopup);

  const handleNewFolder = () => {
    setShowNewFolderModal(true);
    closeUploadPopup();
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim() || !accessToken) return;

    setIsCreatingFolder(true);
    try {
      const response = await fetch("/api/files/folders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ folderPath: folderName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      eventBus.emit(FILES_REFRESH_EVENT);
      setShowNewFolderModal(false);
      setFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Failed to create folder. Please try again.");
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
    setUploadMode(mode);
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
          preSelectedFiles={
            uploadMode === "file"
              ? fileInputRef.current?.files
              : folderInputRef.current?.files
          }
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
        preSelectedFiles={
          uploadMode === "file"
            ? fileInputRef.current?.files
            : folderInputRef.current?.files
        }
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
