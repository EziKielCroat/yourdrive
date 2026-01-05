import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../store/authStore";

interface FilePreviewProps {
  fileId: string;
  fileName: string;
  mimeType?: string;
  onClose: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  fileId,
  fileName,
  mimeType,
  onClose,
}) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilePreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the signed download URL from your API
        const response = await fetch(`/api/files/download/${fileId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !data.file?.downloadUrl) {
          throw new Error("No download URL received from server");
        }

        // Use the signed URL directly for preview
        setPreviewUrl(data.file.downloadUrl);
      } catch (err) {
        console.error("Error fetching file preview:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load file preview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFilePreview();
  }, [fileId, accessToken]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    try {
      if (previewUrl) {
        // Use the existing preview URL for download
        const a = document.createElement("a");
        a.href = previewUrl;
        a.download = fileName;
        a.target = "_blank"; // Open in new tab for better compatibility
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch download URL if preview failed
        const response = await fetch(`/api/files/download/${fileId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to get download URL");
        }

        const data = await response.json();

        if (data.success && data.file?.downloadUrl) {
          const a = document.createElement("a");
          a.href = data.file.downloadUrl;
          a.download = fileName;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading preview...</LoadingText>
        </LoadingContainer>
      );
    }

    if (error || !previewUrl) {
      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>{error || "Unable to preview this file"}</ErrorText>
          <DownloadButton onClick={handleDownload}>
            Download File
          </DownloadButton>
        </ErrorContainer>
      );
    }

    // Image preview
    if (mimeType?.startsWith("image/")) {
      return (
        <ImagePreview>
          <img src={previewUrl} alt={fileName} />
        </ImagePreview>
      );
    }

    // PDF preview
    if (mimeType === "application/pdf") {
      return (
        <PdfPreview>
          <iframe src={previewUrl} title={fileName} />
        </PdfPreview>
      );
    }

    // Video preview
    if (mimeType?.startsWith("video/")) {
      return (
        <VideoPreview>
          <video controls src={previewUrl}>
            Your browser does not support video playback.
          </video>
        </VideoPreview>
      );
    }

    // Audio preview
    if (mimeType?.startsWith("audio/")) {
      return (
        <AudioPreview>
          <AudioIcon>🎵</AudioIcon>
          <AudioPlayer controls src={previewUrl}>
            Your browser does not support audio playback.
          </AudioPlayer>
        </AudioPreview>
      );
    }

    // Text/code preview - including JavaScript
    if (
      mimeType?.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      mimeType === "text/javascript" ||
      fileName.endsWith(".js") ||
      fileName.endsWith(".jsx") ||
      fileName.endsWith(".ts") ||
      fileName.endsWith(".tsx") ||
      fileName.endsWith(".css") ||
      fileName.endsWith(".html") ||
      fileName.endsWith(".json") ||
      fileName.endsWith(".md") ||
      fileName.endsWith(".txt")
    ) {
      return (
        <TextPreview>
          <iframe
            src={previewUrl}
            title={fileName}
            sandbox="allow-same-origin"
          />
        </TextPreview>
      );
    }

    // Unsupported type - show download option
    return (
      <UnsupportedContainer>
        <FileIcon>📄</FileIcon>
        <UnsupportedText>
          Preview not available for this file type
        </UnsupportedText>
        <FileTypeText>Type: {mimeType || "Unknown"}</FileTypeText>
        <DownloadButton onClick={handleDownload}>Download File</DownloadButton>
      </UnsupportedContainer>
    );
  };

  return (
    <Backdrop onClick={handleBackdropClick}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <FileName title={fileName}>{fileName}</FileName>
          <Actions>
            <ActionButton onClick={handleDownload}>Download</ActionButton>
            <CloseButton onClick={onClose}>×</CloseButton>
          </Actions>
        </Header>
        <PreviewContent>{renderPreview()}</PreviewContent>
      </Modal>
    </Backdrop>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
`;

const FileName = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: #202124;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 16px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 32px;
  line-height: 1;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top-color: #1a73e8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.span`
  color: #5f6368;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
`;

const ErrorText = styled.div`
  color: #5f6368;
  font-size: 14px;
  text-align: center;
`;

const UnsupportedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
`;

const FileIcon = styled.div`
  font-size: 64px;
`;

const UnsupportedText = styled.div`
  color: #5f6368;
  font-size: 14px;
  text-align: center;
`;

const FileTypeText = styled.div`
  color: #80868b;
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
`;

const DownloadButton = styled.button`
  padding: 10px 24px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1557b0;
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PdfPreview = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const VideoPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  video {
    max-width: 100%;
    max-height: 100%;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AudioPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
`;

const AudioIcon = styled.div`
  font-size: 64px;
`;

const AudioPlayer = styled.audio`
  width: 100%;
  max-width: 500px;
`;

const TextPreview = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;

  iframe {
    width: 100%;
    height: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: white;
  }
`;

export default FilePreview;
