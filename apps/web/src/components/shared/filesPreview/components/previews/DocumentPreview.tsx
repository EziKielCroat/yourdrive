import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  DownloadIcon as Download,
  SearchIcon as Search,
  FileTextIcon as FileText,
  ZoomInIcon as ZoomIn,
  ZoomOutIcon as ZoomOut,
  BookOpenIcon as BookOpen,
  HashIcon as Hash,
  CopyIcon as Copy,
} from "../../../icons/index";
import mammoth from "mammoth";
import api from "../../../../../lib/axios";

interface DocumentPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  headers?: Record<string, string>;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  headers,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocument();
  }, [url]);

  const loadDocument = async () => {
    try {
      setLoading(true);

      // Check if URL is absolute (external) or relative (needs baseURL)
      const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
      
      let arrayBuffer: ArrayBuffer;
      
      if (isAbsoluteUrl) {
        // For absolute URLs (signed S3 URLs), use fetch directly
        const fetchResponse = await fetch(url, { headers });
        if (!fetchResponse.ok) {
          throw new Error(`Failed to load file: ${fetchResponse.status}`);
        }
        arrayBuffer = await fetchResponse.arrayBuffer();
      } else {
        // For relative URLs, use axios API instance to ensure authentication headers
        const response = await api.get(url, {
          responseType: 'arraybuffer',
          headers: headers,
        });
        arrayBuffer = response.data;
      }
      const extension = fileName.toLowerCase().split(".").pop();

      let text = "";

      if (extension === "docx") {
        // Use mammoth for .docx files
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (extension === "rtf" || extension === "odt") {
        // For RTF and ODT, try to extract text
        // Note: This is a simple implementation - consider using a library like unrtf for RTF
        const decoder = new TextDecoder("utf-8");
        text = decoder.decode(arrayBuffer);

        // Simple RTF text extraction (remove RTF tags)
        if (extension === "rtf") {
          text = text.replace(/\\[^{}]+|\{[^{}]*\}/g, "");
        }
      } else {
        // Fallback for other text documents
        const decoder = new TextDecoder("utf-8");
        text = decoder.decode(arrayBuffer);
      }

      setContent(text);

      // Calculate word count
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      setWordCount(words.length);

      // Estimate page count (assuming 250 words per page)
      setPageCount(Math.ceil(words.length / 250));

      setLoading(false);
    } catch (err) {
      setError("Failed to load document. The format may not be supported.");
      onError?.("Failed to load document");
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;

    const regex = new RegExp(
      `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    return text
      .split(regex)
      .map((part) => (regex.test(part) ? `<mark>${part}</mark>` : part))
      .join("");
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading document...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to load document</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download Document
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Toolbar>
        <ZoomControls>
          <ZoomButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut size={16} />
          </ZoomButton>
          <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
          <ZoomButton onClick={handleZoomIn} disabled={zoom >= 2}>
            <ZoomIn size={16} />
          </ZoomButton>
          <ZoomButton onClick={handleResetZoom}>Reset</ZoomButton>
        </ZoomControls>

        <SearchBox>
          <Search size={16} />
          <SearchInput
            type="text"
            placeholder="Search in document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ToolbarButtons>
          <ToolbarButton onClick={handleCopy}>
            <Copy size={16} />
            Copy Text
          </ToolbarButton>
          {onDownload && (
            <ToolbarButton $primary onClick={onDownload}>
              <Download size={16} />
              Download
            </ToolbarButton>
          )}
        </ToolbarButtons>
      </Toolbar>

      <ContentContainer>
        <DocumentInfo>
          <InfoItem>
            <FileText size={14} />
            <strong>{wordCount}</strong> words
          </InfoItem>
          <InfoItem>
            <BookOpen size={14} />
            <strong>{pageCount}</strong> pages (estimated)
          </InfoItem>
          <InfoItem>
            <Hash size={14} />
            {content.split("\n").length} lines
          </InfoItem>
        </DocumentInfo>

        <DocumentContent
          ref={contentRef}
          $zoom={zoom}
          dangerouslySetInnerHTML={{
            __html: highlightSearchTerm(
              content
                .replace(/\n/g, "<br>")
                .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"),
              searchTerm,
            ),
          }}
        />
      </ContentContainer>

      <StatusBar>
        <StatusInfo>{fileName} • Document</StatusInfo>
        <StatusInfo>Zoom: {Math.round(zoom * 100)}%</StatusInfo>
      </StatusBar>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
`;

const LoadingContainer = styled.div`
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

const ErrorContainer = styled.div`
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

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #dadce0;
  gap: 16px;
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ZoomButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border: 1px solid #dadce0;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #202124;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const ZoomLevel = styled.span`
  font-size: 12px;
  min-width: 50px;
  text-align: center;
  font-weight: 500;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #dadce0;
  border-radius: 4px;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
  background: transparent;
  color: #202124;

  &::placeholder {
    color: #9aa0a6;
  }
`;

const ToolbarButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ToolbarButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid ${({ $primary }) => ($primary ? "#1a73e8" : "#dadce0")};
  background: ${({ $primary }) => ($primary ? "#1a73e8" : "white")};
  color: ${({ $primary }) => ($primary ? "white" : "#202124")};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${({ $primary }) => ($primary ? "#0d62d9" : "#f8f9fa")};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #f8f9fa;
`;

const DocumentInfo = styled.div`
  display: flex;
  gap: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5f6368;

  strong {
    color: #202124;
  }
`;

const DocumentContent = styled.div<{ $zoom: number }>`
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  font-size: ${({ $zoom }) => $zoom * 16}px;
  color: #202124;
  transform-origin: top left;

  mark {
    background: #fff59d;
    padding: 2px 4px;
    border-radius: 2px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.3;
  }

  p {
    margin-bottom: 1em;
  }

  ul,
  ol {
    margin-left: 2em;
    margin-bottom: 1em;
  }

  li {
    margin-bottom: 0.5em;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #dadce0;
  font-size: 12px;
  color: #5f6368;
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default DocumentPreview;
