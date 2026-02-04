import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Overlay,
  Container,
  ContentWrapper,
} from "./styles/filePreview.styles";

import { Header } from "./components/Header";
import PreviewRenderer from "./components/Preview";
import { InfoSidebar } from "./components/InfoSidebar";
import SharePopup from "../popups/share/SharePopup";

import { useFileLoader } from "../hooks/useFileLoader";
import { usePopupStore } from "../popups/popup.store";
import { useAuthStore } from "../../../store/authStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { toast } from "../../../services/toast.service";

export interface FilePreviewProps {
  fileId?: string;
  url?: string;
  fileName: string;
  mimeType?: string;
  fileType?: string;
  onClose: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onFavorite?: () => void;
  allFiles?: Array<{
    id: string;
    name: string;
    type?: string;
    mimeType?: string;
    url?: string;
  }>;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  ownerName?: string;
  files?: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  metadata?: Record<string, any>;
  comments?: Array<{ user: string; text: string; timestamp: string }>;
  activityLog?: Array<{ action: string; user: string; timestamp: string }>;
  relatedFiles?: Array<{ name: string; url: string }>;
  tags?: string[];
  viewers?: Array<{ name: string; avatar?: string }>;
  onToast?: (options: {
    type: "success" | "error" | "info" | "warning";
    message: string;
  }) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  fileId,
  url: propUrl,
  fileName,
  mimeType,
  fileType,
  onClose,
  onEdit,
  onDownload,
  onRename,
  onDelete,
  onFavorite,
  allFiles = [],
  currentIndex = -1,
  onNavigate,
  ownerName,
  files = [],
  metadata,
  comments = [],
  activityLog = [],
  relatedFiles = [],
  tags = [],
  viewers = [],
  onToast, // Keep this prop for backward compatibility
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  const toggleSharingPopup = usePopupStore((state) => state.toggleSharingPopup);
  const isSharingPopupOpen = usePopupStore((state) => state.isSharingPopupOpen);

  const hasNavigation = allFiles.length > 1 && currentIndex >= 0 && onNavigate;
  const hasPrevious = hasNavigation && currentIndex > 0;
  const hasNext = hasNavigation && currentIndex < allFiles.length - 1;

  const { fileUrl, detectedType, loading, error } = useFileLoader({
    fileId,
    propUrl,
    fileName,
    mimeType,
    fileType,
  });

  // Helper function to show toast - supports both prop and global toast
  const showToast = (options: {
    type: "success" | "error" | "info" | "warning";
    message: string;
  }) => {
    if (onToast) {
      // Use prop if provided
      onToast(options);
    } else {
      // Use global toast service
      switch (options.type) {
        case "success":
          toast.success(options.message);
          break;
        case "error":
          toast.error(options.message);
          break;
        case "info":
          toast.info(options.message);
          break;
        case "warning":
          toast.warning(options.message);
          break;
      }
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Show success toast
      showToast({
        type: "success",
        message: "Download started",
      });
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      setIsTransitioning(true);
      setTimeout(() => {
        onNavigate(currentIndex - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      setIsTransitioning(true);
      setTimeout(() => {
        onNavigate(currentIndex + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleShare = () => {
    toggleSharingPopup();
  };

  const commonProps = {
    url: fileUrl,
    fileName,
    fileType: detectedType,
    fileId,
    onClose,
    onEdit,
    onDownload: handleDownload,
    onShare: handleShare,
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const checkIfFavorited = async () => {
    if (!fileId) return;

    try {
      const response = await fetch(`/api/files/favorites/check-favorites`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      if (data.success) setIsFavorited(data.favorites.includes(fileId));
    } catch (err) {
      console.error("Error checking favorite:", err);
      showToast({
        type: "error",
        message: "Failed to check favorite status",
      });
    }
  };

  const handleFavorite = async () => {
    if (!fileId) return;

    try {
      const response = await fetch(`/api/files/favorites/${fileId}/favorite`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      if (data.success) {
        setIsFavorited(data.favorited);
        showToast({
          type: "success",
          message: data.favorited
            ? "Added to favorites"
            : "Removed from favorites",
        });
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      showToast({
        type: "error",
        message: "Failed to update favorites",
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if a modal is open (except share popup)
      if (isSharingPopupOpen && e.key !== "Escape") {
        return;
      }

      // Handle Escape key
      if (e.key === "Escape") {
        if (isSharingPopupOpen) {
          toggleSharingPopup();
        } else {
          onClose();
        }
        return;
      }

      // Handle navigation arrows
      if (hasNavigation && e.key === "ArrowLeft" && hasPrevious) {
        e.preventDefault();
        handlePrevious();
        return;
      }

      if (hasNavigation && e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        handleNext();
        return;
      }

      // Handle info panel toggle (Ctrl+I)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setShowInfo((prev) => !prev);
        return;
      }

      // Handle share shortcut (Ctrl+Shift+S)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();
        handleShare();
        return;
      }

      // Handle download shortcut (Ctrl+S)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "s" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        handleDownload();
        return;
      }

      // Handle favorite shortcut (S)
      if (
        e.key.toLowerCase() === "s" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        handleFavorite();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onClose,
    hasNavigation,
    hasPrevious,
    hasNext,
    currentIndex,
    onNavigate,
    isSharingPopupOpen,
    showInfo,
    toggleSharingPopup,
    handlePrevious,
    handleNext,
    handleDownload,
    handleShare,
    handleFavorite,
  ]);

  useEffect(() => {
    if (fileId && accessToken) {
      checkIfFavorited();
    }
  }, [fileId, accessToken]);

  return (
    <Overlay onClick={handleBackdropClick}>
      <Container>
        <Header
          fileName={fileName}
          ownerName={ownerName}
          files={allFiles.length > 0 ? allFiles : files}
          currentIndex={currentIndex >= 0 ? currentIndex : 0}
          onNavigate={onNavigate}
          onRename={onRename}
          onClose={onClose}
          handleShare={handleShare}
          handleFavorite={handleFavorite}
          isFavorited={isFavorited}
          handleDownload={handleDownload}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
        />

        <ContentWrapper $isTransitioning={isTransitioning}>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading file...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorIcon>⚠️</ErrorIcon>
              <ErrorText>{error}</ErrorText>
              <ErrorSubtext>Please try again or contact support</ErrorSubtext>
            </ErrorContainer>
          ) : (
            <PreviewRenderer
              type={detectedType}
              common={commonProps}
              files={allFiles.length > 0 ? allFiles : files}
              index={currentIndex >= 0 ? currentIndex : 0}
              onNavigate={onNavigate}
            />
          )}

          <InfoSidebar
            show={showInfo}
            mimeType={mimeType}
            fileType={fileType}
            detectedType={detectedType}
            metadata={metadata}
            tags={tags}
            viewers={viewers}
            comments={comments}
            activityLog={activityLog}
            relatedFiles={relatedFiles}
          />
        </ContentWrapper>

        {hasPrevious && (
          <NavButton $position="left" onClick={handlePrevious}>
            <ChevronLeft size={32} />
          </NavButton>
        )}

        {hasNext && (
          <NavButton $position="right" onClick={handleNext}>
            <ChevronRight size={32} />
          </NavButton>
        )}
      </Container>

      {isSharingPopupOpen && fileId && (
        <SharePopup
          fileId={fileId}
          fileName={fileName}
          onClose={toggleSharingPopup}
        />
      )}
    </Overlay>
  );
};

// Keyframes definitions
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

// Styled components
const NavButton = styled.button<{ $position: "left" | "right" }>`
  position: absolute;
  top: 50%;
  ${({ $position }) => ($position === "left" ? "left: 24px;" : "right: 24px;")}
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #202124;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-out 0.2s forwards;

  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  &:focus-visible {
    outline: 2px solid #1a73e8;
    outline-offset: 2px;
  }
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #f8f9fa;
  animation: ${fadeIn} 0.2s ease-out;
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #5f6368;
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ErrorContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 40px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 8px;
  animation: ${slideIn} 0.4s ease-out;
`;

const ErrorText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #d93025;
  text-align: center;
  max-width: 500px;
`;

const ErrorSubtext = styled.div`
  font-size: 14px;
  color: #5f6368;
  text-align: center;
`;

export default FilePreview;
