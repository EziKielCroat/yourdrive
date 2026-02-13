import React, { useMemo, useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { getFileTypeInfo, type FileTypeInfo } from "../utils/FileTypeDetector";
import api from "../../../../lib/axios";

const ImagePreview = React.lazy(() => import("./previews/ImagePreview"));
const VideoPreview = React.lazy(() => import("./previews/VideoPreview"));
const AudioPreview = React.lazy(() => import("./previews/AudioPreview"));
const PDFPreview = React.lazy(() => import("./previews/PDFPreview"));
const SpreadsheetPreview = React.lazy(
  () => import("./previews/SpreadsheetPreview"),
);
const TextPreview = React.lazy(() => import("./previews/TextPreview"));
const CodePreview = React.lazy(() => import("./previews/CodePreview"));
const DocumentPreview = React.lazy(() => import("./previews/DocumentPreview"));
const OfficePreview = React.lazy(() => import("./previews/OfficePreview"));
const ArchivePreview = React.lazy(() => import("./previews/ArchivePreview.tsx"));
const DefaultPreview = React.lazy(() => import("./previews/DefaultPreview"));

export interface FilePreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  maxSize?: number;
  headers?: Record<string, string>;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  url,
  fileName,
  mimeType,
  onDownload,
  onClose,
  onError,
  className,
  maxSize = 50 * 1024 * 1024, // 50MB default
  headers = {},
}) => {
  const [fileTypeInfo, setFileTypeInfo] = useState<FileTypeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const info = getFileTypeInfo(fileName, mimeType);
    setFileTypeInfo(info);

    // Check file size if needed
    if (info.type !== "video" && info.type !== "audio") setLoading(false);
  }, [fileName, mimeType]);

  const shouldSendHeadersForUrl = useCallback((targetUrl: string) => {
    // Never attach auth/custom headers to third-party/signed URLs.
    // It can trigger CORS preflight and break previews.
    if (
      targetUrl.startsWith("/") ||
      targetUrl.startsWith("./") ||
      targetUrl.startsWith("../")
    ) {
      return true;
    }

    try {
      const parsed = new URL(targetUrl, window.location.href);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }, []);

  const effectiveHeaders = useMemo(
    () => (shouldSendHeadersForUrl(url) ? headers : {}),
    [headers, shouldSendHeadersForUrl, url],
  );

  const checkFileSize = useCallback(async () => {
    try {
      // Check if URL is absolute (external) or relative (needs baseURL)
      const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
      
      let size: number;
      
      if (isAbsoluteUrl) {
        // For absolute URLs, use fetch HEAD request
        const response = await fetch(url, {
          method: "HEAD",
          headers: effectiveHeaders,
        });
        size = parseInt(response.headers.get("content-length") || "0");
      } else {
        // For relative URLs, use axios API instance
        const response = await api.head(url, {
          headers: effectiveHeaders,
        });
        size = parseInt(response.headers['content-length'] || "0");
      }

      if (size > maxSize) {
        setError(
          `File is too large to preview (${formatFileSize(size)}). Maximum size: ${formatFileSize(maxSize)}`,
        );
      }
      setLoading(false);
    } catch {
      setLoading(false);
      // Continue anyway, size check is not critical
    }
  }, [effectiveHeaders, maxSize, url]);

  useEffect(() => {
    if (!fileTypeInfo) return;
    if (fileTypeInfo.type === "video" || fileTypeInfo.type === "audio") {
      checkFileSize();
    }
  }, [checkFileSize, fileTypeInfo]);

  const handleError = useCallback(
    (errorMessage: string) => {
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    },
    [onError],
  );

  const handleRetry = () => {
    setError(null);
    setRetryCount((prev) => prev + 1);
    setLoading(true);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
  };

  if (!fileTypeInfo) {
    return (
      <Container className={className}>
        <LoadingState>
          <Spinner />
          <p>Detecting file type...</p>
        </LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={className}>
        <ErrorState>
          <ErrorIcon>⚠️</ErrorIcon>
          <h3>Unable to Preview File</h3>
          <p>{error}</p>
          <ButtonGroup>
            {retryCount < 3 && <Button onClick={handleRetry}>Retry</Button>}
            <Button $primary onClick={handleDownload}>
              Download File
            </Button>
          </ButtonGroup>
        </ErrorState>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className={className}>
        <LoadingState>
          <Spinner />
          <p>Loading preview...</p>
        </LoadingState>
      </Container>
    );
  }

  const commonProps = {
    url,
    fileName,
    mimeType: fileTypeInfo.mimeType || mimeType,
    onDownload: handleDownload,
    onError: handleError,
    headers: effectiveHeaders,
  };

  const renderPreviewer = () => {
    switch (fileTypeInfo.previewCategory) {
      case "image":
        return <ImagePreview {...commonProps} />;
      case "video":
        return <VideoPreview {...commonProps} maxSize={maxSize} />;
      case "audio":
        return <AudioPreview {...commonProps} maxSize={maxSize} />;
      case "pdf":
        return <PDFPreview {...commonProps} />;
      case "spreadsheet":
        return <SpreadsheetPreview {...commonProps} />;
      case "text":
        return <TextPreview {...commonProps} />;
      case "code":
        return <CodePreview {...commonProps} />;
      case "document":
        return <DocumentPreview {...commonProps} />;
      case "office":
        return (
          <OfficePreview
            key={url}
            url={url}
            fileName={fileName}
            fileType={fileTypeInfo.extension}
            onClose={() => onClose?.()}
            onDownload={handleDownload}
          />
        );
      case "archive":
        return <ArchivePreview {...commonProps} />;
      default:
        return <DefaultPreview {...commonProps} fileTypeInfo={fileTypeInfo} />;
    }
  };

  return (
    <Container className={className}>
      <React.Suspense
        fallback={
          <LoadingState>
            <Spinner />
            <p>Loading preview component...</p>
          </LoadingState>
        }
      >
        {renderPreviewer()}
      </React.Suspense>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
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

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  gap: 16px;
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

export default FilePreview;
