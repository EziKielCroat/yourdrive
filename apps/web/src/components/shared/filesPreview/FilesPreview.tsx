import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Overlay,
  Container,
  ContentWrapper,
} from "./styles/filePreview.styles";

import { Header } from "./components/Header";
import PreviewRenderer from "./components/Preview";
import { InfoSidebar } from "./components/InfoSidebar";

import { useFileLoader } from "../hooks/useFileLoader";

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
  files?: Array<{
    url?: string;
    fileId?: string;
    fileName: string;
    fileType?: string;
    mimeType?: string;
  }>;
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  metadata?: Record<string, any>;
  comments?: Array<{ user: string; text: string; timestamp: string }>;
  activityLog?: Array<{ action: string; user: string; timestamp: string }>;
  relatedFiles?: Array<{ name: string; url: string }>;
  tags?: string[];
  viewers?: Array<{ name: string; avatar?: string }>;
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
  onShare,
  onRename,
  onDelete,
  onFavorite,
  files = [],
  currentIndex = 0,
  onNavigate,
  metadata,
  comments = [],
  activityLog = [],
  relatedFiles = [],
  tags = [],
  viewers = [],
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const { fileUrl, detectedType, loading, error } = useFileLoader({
    fileId,
    propUrl,
    fileName,
    mimeType,
    fileType,
  });

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
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (onFavorite) onFavorite();
  };

  const commonProps = {
    url: fileUrl,
    fileName,
    fileType: detectedType,
    fileId,
    onClose,
    onEdit,
    onDownload: handleDownload,
    onShare,
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (files.length > 1 && onNavigate) {
        if (e.key === "ArrowLeft" && currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
        if (e.key === "ArrowRight" && currentIndex < files.length - 1) {
          onNavigate(currentIndex + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, files.length, currentIndex, onNavigate]);

  console.log({
    fileName,
    mimeType,
    fileType,
    detectedType,
    fileUrl,
    loading,
    error,
  });

  return (
    <Overlay onClick={handleBackdropClick}>
      <Container>
        <Header
          fileName={fileName}
          files={files}
          currentIndex={currentIndex}
          onNavigate={onNavigate}
          onRename={onRename}
          onShare={onShare}
          onClose={onClose}
          handleFavorite={handleFavorite}
          isFavorited={isFavorited}
          handleDownload={handleDownload}
          setShowInfo={setShowInfo}
          showInfo={showInfo}
        />

        <ContentWrapper>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading file...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorIcon>error</ErrorIcon>
              <ErrorText>{error}</ErrorText>
              <ErrorSubtext>Please try again or contact support</ErrorSubtext>
            </ErrorContainer>
          ) : (
            <PreviewRenderer
              type={detectedType}
              common={commonProps}
              files={files}
              index={currentIndex}
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
      </Container>
    </Overlay>
  );
};

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
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
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

export default FilePreview;
