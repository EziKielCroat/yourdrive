import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Download, Search, Copy, FileText, Hash, Type } from "lucide-react";
import api from "../../../../../lib/axios";

interface TextPreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  headers?: Record<string, string>;
}

const TextPreview: React.FC<TextPreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  headers,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadFile();
  }, [url]);

  const loadFile = async () => {
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

      // Handle different encodings

      // Try UTF-8 first
      try {
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(arrayBuffer);
        setContent(text);
      } catch (e) {
        // Fallback to Latin1
        const decoder = new TextDecoder("iso-8859-1");
        const text = decoder.decode(arrayBuffer);
        setContent(text);
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to load text file");
      onError?.("Failed to load text file");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const lines = content.split("\n");
    const results: number[] = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push(index);
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [searchTerm, content]);

  const handleSearchNext = () => {
    if (searchResults.length === 0) return;

    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    scrollToLine(searchResults[nextIndex]);
  };

  const handleSearchPrev = () => {
    if (searchResults.length === 0) return;

    const prevIndex =
      (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    scrollToLine(searchResults[prevIndex]);
  };

  const scrollToLine = (lineNumber: number) => {
    const lineHeight = 20; // Approximate line height
    const scrollTop = lineNumber * lineHeight;

    if (textareaRef.current) {
      textareaRef.current.scrollTop = scrollTop - 100; // Scroll with some padding
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey) {
      handleSearchPrev();
    } else if (e.key === "Enter") {
      handleSearchNext();
    }
  };

  const stats = {
    lines: content.split("\n").length,
    words: content.split(/\s+/).filter((word) => word.length > 0).length,
    characters: content.length,
    charactersNoSpaces: content.replace(/\s+/g, "").length,
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading text file...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to load text file</h3>
        <p>{error}</p>
        <ButtonGroup>
          <Button onClick={() => window.open(url, "_blank")}>
            Open in new tab
          </Button>
          {onDownload && (
            <Button $primary onClick={onDownload}>
              <Download size={16} />
              Download File
            </Button>
          )}
        </ButtonGroup>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Toolbar>
        <SearchBox>
          <Search size={16} />
          <SearchInput
            type="text"
            placeholder="Search in file..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
          {searchTerm && (
            <SearchResults>
              {searchResults.length > 0 ? (
                <>
                  {currentSearchIndex + 1} of {searchResults.length}
                  <SearchNavButton onClick={handleSearchPrev}>
                    ↑
                  </SearchNavButton>
                  <SearchNavButton onClick={handleSearchNext}>
                    ↓
                  </SearchNavButton>
                </>
              ) : (
                "No matches"
              )}
            </SearchResults>
          )}
        </SearchBox>

        <ToolbarButtons>
          <ToolbarButton
            $active={showLineNumbers}
            onClick={() => setShowLineNumbers(!showLineNumbers)}
          >
            <Hash size={16} />
            Line Numbers
          </ToolbarButton>

          <ToolbarButton
            $active={wordWrap}
            onClick={() => setWordWrap(!wordWrap)}
          >
            <Type size={16} />
            Word Wrap
          </ToolbarButton>

          <ToolbarButton onClick={handleCopy}>
            <Copy size={16} />
            Copy
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
        {showLineNumbers && (
          <LineNumbers>
            {content.split("\n").map((_, index) => (
              <LineNumber
                key={index + 1}
                $highlighted={searchResults.includes(index)}
                $current={searchResults[currentSearchIndex] === index}
              >
                {index + 1}
              </LineNumber>
            ))}
          </LineNumbers>
        )}

        <TextArea
          ref={textareaRef}
          value={content}
          readOnly
          $wordWrap={wordWrap}
          $hasLineNumbers={showLineNumbers}
        />
      </ContentContainer>

      <StatusBar>
        <Stats>
          <StatItem>
            <FileText size={12} />
            {stats.lines} lines
          </StatItem>
          <StatItem>
            <span>•</span>
            {stats.words} words
          </StatItem>
          <StatItem>
            <span>•</span>
            {stats.characters} chars
          </StatItem>
          <StatItem>
            <span>•</span>
            {stats.charactersNoSpaces} chars (no spaces)
          </StatItem>
        </Stats>

        <EncodingInfo>UTF-8 • Text File</EncodingInfo>
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

const SearchResults = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #5f6368;
  white-space: nowrap;
`;

const SearchNavButton = styled.button`
  background: none;
  border: none;
  color: #5f6368;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;

  &:hover {
    color: #202124;
  }
`;

const ToolbarButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ToolbarButton = styled.button<{ $active?: boolean; $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid
    ${({ $active, $primary }) =>
      $primary ? "#1a73e8" : $active ? "#1a73e8" : "#dadce0"};
  background: ${({ $active, $primary }) =>
    $primary ? "#1a73e8" : $active ? "#e8f0fe" : "white"};
  color: ${({ $active, $primary }) =>
    $primary ? "white" : $active ? "#1a73e8" : "#202124"};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${({ $active, $primary }) =>
      $primary ? "#0d62d9" : $active ? "#d2e3fc" : "#f8f9fa"};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
`;

const LineNumbers = styled.div`
  background: #f8f9fa;
  border-right: 1px solid #dadce0;
  padding: 8px 4px 8px 12px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #5f6368;
  text-align: right;
  overflow-y: auto;
  user-select: none;
`;

const LineNumber = styled.div<{ $highlighted: boolean; $current: boolean }>`
  padding: 0 4px;
  background: ${({ $highlighted, $current }) =>
    $current ? "#1a73e8" : $highlighted ? "#fef7e0" : "transparent"};
  color: ${({ $current }) => ($current ? "white" : "inherit")};
  border-radius: 2px;
  margin-bottom: 1px;
`;

const TextArea = styled.textarea<{
  $wordWrap: boolean;
  $hasLineNumbers: boolean;
}>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #202124;
  background: white;
  resize: none;
  white-space: ${({ $wordWrap }) => ($wordWrap ? "pre-wrap" : "pre")};
  overflow-wrap: ${({ $wordWrap }) => ($wordWrap ? "break-word" : "normal")};
  overflow-x: ${({ $wordWrap }) => ($wordWrap ? "hidden" : "auto")};
  overflow-y: auto;
  tab-size: 2;

  &::selection {
    background: #cfe2ff;
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f8f9fa;
  border-top: 1px solid #dadce0;
  font-size: 11px;
  color: #5f6368;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EncodingInfo = styled.div`
  font-style: italic;
`;

export default TextPreview;
