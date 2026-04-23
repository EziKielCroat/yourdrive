import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { DownloadIcon as Download } from "../../../icons/index";

interface VideoPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  maxSize?: number;
  headers?: Record<string, string>;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  url,
  fileName,
  mimeType,
  onDownload,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      const errorMsg = video.error
        ? `Failed to load video: ${video.error.message}`
        : "Failed to load video. The format may not be supported.";
      setError(errorMsg);
      onError?.(errorMsg);
    };

    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("error", handleError);
    };
  }, [onError]);

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to play video</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download Video
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  const extension = fileName.toLowerCase().split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    mkv: "video/x-matroska",
  };
  const videoType = mimeTypes[extension] || mimeType || "video/mp4";

  return (
    <Container>
      <Video
        ref={videoRef}
        controls
        preload="metadata"
        onError={() => {
          setError("Failed to load video. The format or codec may not be supported. Try downloading the file.");
        }}
      >
        <source src={url} type={videoType} />
        Your browser does not support the video tag.
      </Video>
      {onDownload && (
        <DownloadButton onClick={onDownload}>
          <Download size={16} />
          Download
        </DownloadButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const DownloadButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  gap: 16px;
  background: white;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #1a73e8;
    color: white;
    
    &:hover {
      background: #0d62d9;
    }
  `
      : `
    background: white;
    color: #202124;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f8f9fa;
    }
  `}
`;

export default VideoPreview;
