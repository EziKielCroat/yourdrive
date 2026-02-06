import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "./components/Header";
import { InfoSidebar } from "./components/InfoSidebar";
import SharePopup from "../popups/share/SharePopup";
import { useFilePreview } from "./hooks/useFilePreview.ts";
import { usePopupStore } from "../popups/popup.store";
import { useRouter } from "@tanstack/react-router";
import api from "../../../lib/axios";

// Import the new FilePreview system
import FilePreview from "./components/Preview";

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
  metadata?: Record<string, unknown>;
  comments?: Array<{ user: string; text: string; timestamp: string }>;
  activityLog?: Array<{ action: string; user: string; timestamp: string }>;
  relatedFiles?: Array<{ name: string; url: string }>;
  tags?: string[];
  viewers?: Array<{ name: string; avatar?: string }>;
  options?: {
    generateThumbnail?: boolean;
    extractMetadata?: boolean;
    maxSize?: number;
  };
}

const FilesPreview: React.FC<FilePreviewProps> = ({
  fileId,
  url: propUrl,
  fileName,
  mimeType,
  onClose,
  onDownload,
  onShare,
  allFiles = [],
  currentIndex = 0,
  onNavigate,
  options = {},
  ...props
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const toggleSharingPopup = usePopupStore((state) => state.toggleSharingPopup);
  const isSharingPopupOpen = usePopupStore((state) => state.isSharingPopupOpen);

  const {
    previewUrl,
    previewCategory,
    isLoading,
    error,
    metadata,
    refreshPreview,
  } = useFilePreview({
    fileId,
    url: propUrl,
    fileName,
    mimeType,
    options,
  });

  const hasNavigation = allFiles.length > 1 && currentIndex >= 0 && onNavigate;
  const hasPrevious = hasNavigation && currentIndex > 0;
  const hasNext = hasNavigation && currentIndex < allFiles.length - 1;

  const headerFiles = allFiles.map((f) => ({
    url: f.url,
    fileId: f.id,
    fileName: f.name,
    fileType: f.type,
    mimeType: f.mimeType,
  }));

  const handleDownload = async () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Always prefer a proper download URL from the API when we have an ID.
    // (Some preview URLs are authenticated endpoints that won't download via <a>.)
    if (fileId) {
      try {
        const response = await api.get(`/files/download/${fileId}`);
        const data = response.data;
        const downloadUrl =
          data?.file?.downloadUrl || data?.downloadUrl || data?.signedUrl;

        if (downloadUrl) {
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }
      } catch {
        // Fall back to previewUrl below
      }
    }

    if (previewUrl) {
      const link = document.createElement("a");
      link.href = previewUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      toggleSharingPopup();
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFavorite = async () => {
    if (!fileId) return;

    try {
      const response = await api.post(`/files/favorites/${fileId}/favorite`);
      const data = response.data;
      if (data.success) {
        setIsFavorited(data.favorited);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleEdit = () => {
    if (!fileId) return;
    router.navigate({
      to: "/edit/$fileId",
      params: { fileId: fileId.toString() },
    });
  };

  const canEdit = previewCategory === "text" || previewCategory === "code";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSharingPopupOpen && e.key !== "Escape") {
        return;
      }

      if (e.key === "Escape") {
        if (isSharingPopupOpen) {
          toggleSharingPopup();
        } else {
          onClose();
        }
        return;
      }

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

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setShowInfo((prev) => !prev);
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "s"
      ) {
        e.preventDefault();
        handleShare();
        return;
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "s" &&
        !e.shiftKey
      ) {
        e.preventDefault();
        handleDownload();
        return;
      }

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

      if (e.key === "F5") {
        e.preventDefault();
        refreshPreview();
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
    refreshPreview,
  ]);

  useEffect(() => {
    const checkIfFavorited = async () => {
      if (!fileId) return;

      try {
        const response = await api.get(`/files/favorites/check-favorites`);
        const data = response.data;
        if (data.success) setIsFavorited(data.favorites.includes(fileId));
      } catch (err) {
        console.error("Error checking favorite:", err);
      }
    };

    if (fileId) {
      checkIfFavorited();
    }
  }, [fileId]);

  if (isLoading || error) {
    return (
      <Overlay onClick={handleBackdropClick}>
        <Container>
          <Header
            fileId={fileId}
            fileName={fileName}
            files={headerFiles}
            currentIndex={currentIndex}
            onNavigate={onNavigate}
            onClose={onClose}
            handleShare={handleShare}
            handleFavorite={handleFavorite}
            isFavorited={isFavorited}
            handleDownload={handleDownload}
            setShowInfo={setShowInfo}
            showInfo={showInfo}
            onEdit={handleEdit}
            canEdit={canEdit}
          />

          <ContentWrapper $isTransitioning={isTransitioning}>
            {isLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading preview...</LoadingText>
              </LoadingContainer>
            ) : (
              <ErrorContainer>
                <ErrorIcon>⚠️</ErrorIcon>
                <ErrorText>{error}</ErrorText>
                <ErrorSubtext>Please try again or contact support</ErrorSubtext>
                <RetryButton onClick={refreshPreview}>Retry</RetryButton>
              </ErrorContainer>
            )}
          </ContentWrapper>
        </Container>
      </Overlay>
    );
  }

  return (
    <Overlay onClick={handleBackdropClick}>
      <Container>
        <Header
          fileId={fileId}
          fileName={fileName}
          files={headerFiles}
          currentIndex={currentIndex}
          onNavigate={onNavigate}
          onClose={onClose}
          handleShare={handleShare}
          handleFavorite={handleFavorite}
          isFavorited={isFavorited}
          handleDownload={handleDownload}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
          onEdit={handleEdit}
          canEdit={canEdit}
        />

        <ContentWrapper $isTransitioning={isTransitioning}>
          <FilePreview
            url={previewUrl || propUrl || ""}
            fileName={fileName}
            mimeType={mimeType}
            onDownload={handleDownload}
            onClose={onClose}
            maxSize={options.maxSize}
          />

          <InfoSidebar
            show={showInfo}
            mimeType={mimeType}
            fileType={previewCategory}
            detectedType={previewCategory}
            metadata={metadata}
            tags={props.tags}
            viewers={props.viewers}
            comments={props.comments}
            activityLog={props.activityLog}
            relatedFiles={props.relatedFiles}
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

// Styled Components (keep your existing styles)
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Container = styled.div`
  position: relative;
  width: 90vw;
  height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ContentWrapper = styled.div<{ $isTransitioning: boolean }>`
  position: relative;
  height: calc(100% - 64px);
  transition: opacity 0.15s ease-out;
  opacity: ${({ $isTransitioning }) => ($isTransitioning ? 0.5 : 1)};
`;

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
  transition: all 0.2s;
  z-index: 10;
  opacity: 0;
  animation: fadeIn 0.3s ease-out 0.2s forwards;

  &:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
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
`;

const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #5f6368;
  font-weight: 500;
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
`;

const ErrorIcon = styled.div`
  font-size: 64px;
  margin-bottom: 8px;
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

const RetryButton = styled.button`
  margin-top: 16px;
  background: #1a73e8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #0d62d9;
  }
`;

export default FilesPreview;
