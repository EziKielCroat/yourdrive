import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { DownloadIcon as Download } from "../../../icons/index";

interface AudioPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  maxSize?: number;
  headers?: Record<string, string>;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({
  url,
  fileName,
  mimeType,
  onDownload,
  onError,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => {
      const errorMsg = audio.error
        ? `Failed to load audio: ${audio.error.message}`
        : "Failed to load audio. The format may not be supported.";
      setError(errorMsg);
      onError?.(errorMsg);
    };

    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("error", handleError);
    };
  }, [onError]);

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to play audio</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download Audio
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <FileName>{fileName}</FileName>
      <Audio
        ref={audioRef}
        controls
        preload="metadata"
        onError={() => {
          setError("Failed to load audio. The format may not be supported.");
        }}
      >
        <source src={url} type={mimeType || "audio/mpeg"} />
        Your browser does not support the audio tag.
      </Audio>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px;
  background: #f9fafb;
`;

const FileName = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #111827;
  text-align: center;
  max-width: 600px;
  word-break: break-word;
`;

const Audio = styled.audio`
  width: 100%;
  max-width: 600px;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #0d62d9;
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

export default AudioPreview;
