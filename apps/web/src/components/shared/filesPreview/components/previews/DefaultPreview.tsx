import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { DownloadIcon as Download, FileIcon as File, AlertCircleIcon as AlertCircle, ExternalLinkIcon as ExternalLink, ArchiveIcon as Archive } from "../../../icons/index";
import { type FileTypeInfo } from "../../utils/FileTypeDetector";
import api from "../../../../../lib/axios";
import MarkdownDocumentView from "./MarkdownDocumentView";

interface DefaultPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  fileTypeInfo: FileTypeInfo;
  headers?: Record<string, string>;
}

const DefaultPreview: React.FC<DefaultPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  fileTypeInfo,
  headers,
}) => {
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"info" | "text" | "markdown">("info");
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");

  useEffect(() => {
    const fetchFileSize = async () => {
      try {
        // Check if URL is absolute (external) or relative (needs baseURL)
        const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
        
        if (isAbsoluteUrl) {
          // For absolute URLs, use fetch HEAD request
          const response = await fetch(url, { method: "HEAD", headers });
          const size = response.headers.get("content-length");
          setFileSize(size ? parseInt(size) : null);
        } else {
          // For relative URLs, use axios API instance
          const response = await api.head(url, { headers });
          const size = response.headers['content-length'];
          setFileSize(size ? parseInt(size) : null);
        }
      } catch {
        // Ignore size fetch errors
      }
    };

    fetchFileSize();
  }, [url, headers]);

  const isMarkdownFile =
    fileTypeInfo.extension.toLowerCase() === "md" ||
    (fileTypeInfo.mimeType || "").toLowerCase().includes("markdown");

  const canTryTextView = useCallback((): boolean => {
    if (fileSize && fileSize > 512 * 1024) return false;

    const mime = (fileTypeInfo.mimeType || "").toLowerCase();
    if (
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "application/xml" ||
      mime === "application/javascript"
    ) {
      return true;
    }

    const ext = fileTypeInfo.extension.toLowerCase();
    const textLikeExt = [
      "txt",
      "md",
      "json",
      "xml",
      "csv",
      "log",
      "ini",
      "conf",
      "env",
      "yml",
      "yaml",
    ];
    return textLikeExt.includes(ext);
  }, [fileSize, fileTypeInfo.mimeType, fileTypeInfo.extension]);

  const fetchRawText = useCallback(async (): Promise<string> => {
    const isAbsoluteUrl =
      url.startsWith("http://") || url.startsWith("https://");

    if (isAbsoluteUrl) {
      const fetchResponse = await fetch(url, { headers });
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}`);
      }
      const buf = await fetchResponse.arrayBuffer();
      return new TextDecoder("utf-8").decode(buf);
    }

    const res = await api.get(url, {
      responseType: "arraybuffer",
      headers: headers,
    });
    const buf = res.data as ArrayBuffer;
    return new TextDecoder("utf-8").decode(buf);
  }, [url, headers]);

  useEffect(() => {
    if (!isMarkdownFile || viewMode !== "info") return;
    if (fileSize === null) return;
    if (!canTryTextView()) return;

    let cancelled = false;
    (async () => {
      try {
        setTextLoading(true);
        setTextError(null);
        const decoded = await fetchRawText();
        if (cancelled) return;
        setTextContent(decoded);
        setViewMode("markdown");
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Failed to load file as text.";
        if (!cancelled) {
          setTextError(msg);
          onError?.(msg);
        }
      } finally {
        if (!cancelled) setTextLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // onError omitted: optional parent callback; stable dependency list avoids duplicate loads
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [isMarkdownFile, fileSize, viewMode, fetchRawText, canTryTextView]);

  const loadAsText = async () => {
    try {
      setTextLoading(true);
      setTextError(null);
      const decoded = await fetchRawText();
      setTextContent(decoded);
      setViewMode(isMarkdownFile ? "markdown" : "text");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Failed to load file as text.";
      setTextError(msg);
      onError?.(msg);
    } finally {
      setTextLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i >= 2 ? 1 : 0)} ${sizes[i]}`;
  };

  const getFileTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      archive: "Compressed Archive",
      unsupported: "Unsupported File",
      font: "Font File",
      "3d": "3D Model",
      database: "Database File",
    };
    return descriptions[type] || "File";
  };

  const getRecommendedSoftware = (
    extension: string,
    type: string,
  ): string[] => {
    const recommendations: Record<string, string[]> = {
      zip: ["WinZip", "7-Zip", "WinRAR", "The Unarchiver"],
      rar: ["WinRAR", "7-Zip", "The Unarchiver"],
      "7z": ["7-Zip", "WinZip", "The Unarchiver"],
      tar: ["7-Zip", "WinZip", "The Unarchiver"],
      gz: ["7-Zip", "WinZip", "The Unarchiver"],
      ppt: ["Microsoft PowerPoint", "Google Slides", "LibreOffice Impress"],
      pptx: ["Microsoft PowerPoint", "Google Slides", "LibreOffice Impress"],
      heic: ["Photos", "Preview (macOS)", "Third-party converters"],
      heif: ["Photos", "Preview (macOS)", "Third-party converters"],
      exe: ["Windows", "Wine (Linux/macOS)"],
      dmg: ["macOS"],
      deb: ["Ubuntu/Debian", "dpkg"],
      rpm: ["Fedora/RHEL", "rpm"],
      apk: ["Android"],
      iso: ["Virtual Machine", "Burn to disc"],
    };

    if (recommendations[extension]) {
      return recommendations[extension];
    }

    if (type === "archive") {
      return ["7-Zip", "WinZip", "WinRAR", "The Unarchiver"];
    }

    return ["Appropriate software for this file type"];
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank");
  };

  const getFileIcon = () => {
    switch (fileTypeInfo.type) {
      case "archive":
        return <Archive size={64} />;
      default:
        return <File size={64} />;
    }
  };

  return (
    <Container>
      <Content $wide={viewMode === "markdown" || viewMode === "text"}>
        {viewMode === "info" && (
          <>
            {isMarkdownFile && textLoading && (
              <LoadingHint>Loading document…</LoadingHint>
            )}
            <FileIcon>{getFileIcon()}</FileIcon>

            <FileName>{fileName}</FileName>

            <FileDetails>
              <DetailItem>
                <strong>Type:</strong> {getFileTypeDescription(fileTypeInfo.type)}
              </DetailItem>
              <DetailItem>
                <strong>Extension:</strong> .
                {fileTypeInfo.extension.toUpperCase()}
              </DetailItem>
              {fileSize && (
                <DetailItem>
                  <strong>Size:</strong> {formatFileSize(fileSize)}
                </DetailItem>
              )}
            </FileDetails>

            <WarningMessage>
              <AlertCircle size={20} />
              <span>This file type cannot be previewed directly in the browser.</span>
            </WarningMessage>

            <Recommendations>
              <RecommendationTitle>Recommended Software:</RecommendationTitle>
              <SoftwareList>
                {getRecommendedSoftware(
                  fileTypeInfo.extension,
                  fileTypeInfo.type,
                ).map((software, index) => (
                  <SoftwareItem key={index}>{software}</SoftwareItem>
                ))}
              </SoftwareList>
            </Recommendations>

            <ActionButtons>
              <ActionButton onClick={handleOpenInNewTab}>
                <ExternalLink size={16} />
                Open in New Tab
              </ActionButton>

              {onDownload && (
                <ActionButton $primary onClick={onDownload}>
                  <Download size={16} />
                  Download File
                </ActionButton>
              )}
            </ActionButtons>

            {canTryTextView() && (
              <AdditionalInfo>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                    color: "#4b5563",
                  }}
                >
                  This file might be readable as plain text.
                </p>
                <ActionButton
                  onClick={loadAsText}
                  disabled={textLoading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {textLoading
                    ? "Loading…"
                    : isMarkdownFile
                      ? "View as document"
                      : "View as text"}
                </ActionButton>
                {textError && (
                  <p
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.75rem",
                      color: "#b91c1c",
                    }}
                  >
                    {textError}
                  </p>
                )}
              </AdditionalInfo>
            )}

            {!canTryTextView() && (
              <AdditionalInfo>
                <p>
                  To view this file, download it and open it with the appropriate
                  software. Some file types may require specific applications or
                  operating systems.
                </p>
                {fileTypeInfo.type === "archive" && (
                  <p>
                    <strong>Note:</strong> This is a compressed archive. Extract
                    its contents using archiving software.
                  </p>
                )}
          {/* Additional notes can be added here for other types if needed */}
              </AdditionalInfo>
            )}
          </>
        )}

        {viewMode === "text" && (
          <TextViewContainer>
            <TextViewHeader>
              <span>{fileName}</span>
              <TextViewActions>
                <TextViewButton onClick={() => setViewMode("info")}>
                  Back to info
                </TextViewButton>
                {onDownload && (
                  <TextViewButton $primary onClick={onDownload}>
                    <Download size={14} />
                    Download
                  </TextViewButton>
                )}
              </TextViewActions>
            </TextViewHeader>
            <TextArea readOnly value={textContent} />
          </TextViewContainer>
        )}

        {viewMode === "markdown" && (
          <TextViewContainer>
            <TextViewHeader>
              <span>{fileName}</span>
              <TextViewActions>
                <TextViewButton onClick={() => setViewMode("info")}>
                  Back to info
                </TextViewButton>
                {onDownload && (
                  <TextViewButton $primary onClick={onDownload}>
                    <Download size={14} />
                    Download
                  </TextViewButton>
                )}
              </TextViewActions>
            </TextViewHeader>
            <MarkdownDocumentView markdown={textContent} />
          </TextViewContainer>
        )}
      </Content>
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
  background: #f3f4f6;
  padding: 32px;
`;

const Content = styled.div<{ $wide?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: ${({ $wide }) => ($wide ? "min(720px, 100%)" : "520px")};
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
`;

const LoadingHint = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 12px;
`;

const FileIcon = styled.div`
  color: #1f9afe;
  margin-bottom: 20px;
`;

const FileName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 16px;
  word-break: break-word;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
`;

const DetailItem = styled.div`
  strong {
    color: #202124;
    margin-right: 8px;
  }

  color: #5f6368;
`;

const WarningMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
`;

const Recommendations = styled.div`
  margin-bottom: 24px;
  text-align: left;
`;

const RecommendationTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #202124;
  margin-bottom: 8px;
`;

const SoftwareList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SoftwareItem = styled.li`
  padding: 8px 12px;
  background: #e8f0fe;
  border-left: 3px solid #1a73e8;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 13px;
  color: #1a73e8;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: #1a73e8;
    color: white;
    
    &:hover {
      background: #0d62d9;
      transform: translateY(-1px);
    }
  `
      : `
    background: #f8f9fa;
    color: #202124;
    border: 1px solid #dadce0;
    
    &:hover {
      background: #f1f3f4;
      transform: translateY(-1px);
    }
  `}
`;

const AdditionalInfo = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #5f6368;
  text-align: left;
  line-height: 1.5;

  p {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: #202124;
  }
`;

const TextViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
`;

const TextViewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #374151;
`;

const TextViewActions = styled.div`
  display: flex;
  gap: 8px;
`;

const TextViewButton = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid ${({ $primary }) => ($primary ? "#1f9afe" : "#d1d5db")};
  background: ${({ $primary }) => ($primary ? "#1f9afe" : "white")};
  color: ${({ $primary }) => ($primary ? "white" : "#111827")};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${({ $primary }) => ($primary ? "#0d8af2" : "#f3f4f6")};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 260px;
  max-height: 480px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  font-family: "JetBrains Mono", "Consolas", "Menlo", monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  color: #111827;
  background: #f9fafb;
  white-space: pre-wrap;
  overflow-wrap: break-word;

  &::selection {
    background: #bfdbfe;
  }
`;

export default DefaultPreview;
