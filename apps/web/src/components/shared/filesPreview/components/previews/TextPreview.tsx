import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { DownloadIcon as Download, SearchIcon as Search, CopyIcon as Copy, FileTextIcon as FileText, HashIcon as Hash, TypeIcon as Type } from "../../../icons/index";
import api from "../../../../../lib/axios";
import { useUserUiPreferencesStore } from "../../../../../store/userUiPreferencesStore";

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
  fileName: _fileName,
  onDownload,
  onError,
  headers,
}) => {
  const isDark = useUserUiPreferencesStore((s) => s.resolvedTheme === "dark");
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
      <Container $isDark={isDark}>
        <LoadingContainer>
          <Spinner />
          <p>Loading text file...</p>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container $isDark={isDark}>
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
      </Container>
    );
  }

  return (
    <Container $isDark={isDark}>
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

const Container = styled.div<{ $isDark: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  /* CSS custom properties toggled by dark/light mode */
  --tp-bg:          ${({ $isDark }) => ($isDark ? "#1e2024" : "#ffffff")};
  --tp-bg-surface:  ${({ $isDark }) => ($isDark ? "#252830" : "#f8f9fa")};
  --tp-border:      ${({ $isDark }) => ($isDark ? "#3c4048" : "#dadce0")};
  --tp-text:        ${({ $isDark }) => ($isDark ? "#e8eaed" : "#202124")};
  --tp-text-muted:  ${({ $isDark }) => ($isDark ? "#9aa0a6" : "#5f6368")};
  --tp-placeholder: ${({ $isDark }) => ($isDark ? "#6b7280" : "#9aa0a6")};
  --tp-btn-bg:      ${({ $isDark }) => ($isDark ? "#2a2f38" : "#ffffff")};
  --tp-btn-hover:   ${({ $isDark }) => ($isDark ? "#343a44" : "#f8f9fa")};
  --tp-active-bg:   ${({ $isDark }) => ($isDark ? "#1d3a5e" : "#e8f0fe")};
  --tp-active-color:${({ $isDark }) => ($isDark ? "#5ba3f5" : "#1a73e8")};
  --tp-active-hover:${({ $isDark }) => ($isDark ? "#1a3354" : "#d2e3fc")};
  --tp-highlight:   ${({ $isDark }) => ($isDark ? "#3d3515" : "#fef7e0")};
  --tp-selection:   ${({ $isDark }) => ($isDark ? "#1d3a5e" : "#cfe2ff")};

  background: var(--tp-bg);
  color: var(--tp-text);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--tp-text-muted);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--tp-border);
  border-top-color: var(--tp-active-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  color: var(--tp-text);
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
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  ${({ $primary }) =>
    $primary
      ? `
    background: var(--tp-active-color);
    color: #fff;
    border: none;
    &:hover { filter: brightness(0.92); }
  `
      : `
    background: var(--tp-btn-bg);
    color: var(--tp-text);
    border: 1px solid var(--tp-border);
    &:hover { background: var(--tp-btn-hover); }
  `}
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--tp-bg-surface);
  border-bottom: 1px solid var(--tp-border);
  gap: 12px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: var(--tp-bg);
  border: 1px solid var(--tp-border);
  border-radius: 4px;
  flex: 1;
  max-width: 380px;
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 13px;
  background: transparent;
  color: var(--tp-text);

  &::placeholder {
    color: var(--tp-placeholder);
  }
`;

const SearchResults = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--tp-text-muted);
  white-space: nowrap;
`;

const SearchNavButton = styled.button`
  background: none;
  border: none;
  color: var(--tp-text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;

  &:hover {
    color: var(--tp-text);
  }
`;

const ToolbarButtons = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ $active?: boolean; $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  border: 1px solid ${({ $active, $primary }) =>
    $primary ? "var(--tp-active-color)" : $active ? "var(--tp-active-color)" : "var(--tp-border)"};
  background: ${({ $active, $primary }) =>
    $primary ? "var(--tp-active-color)" : $active ? "var(--tp-active-bg)" : "var(--tp-btn-bg)"};
  color: ${({ $active, $primary }) =>
    $primary ? "#fff" : $active ? "var(--tp-active-color)" : "var(--tp-text)"};

  &:hover {
    background: ${({ $active, $primary }) =>
      $primary ? "var(--tp-active-color)" : $active ? "var(--tp-active-hover)" : "var(--tp-btn-hover)"};
    filter: ${({ $primary }) => ($primary ? "brightness(0.92)" : "none")};
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  background: var(--tp-bg);
`;

const LineNumbers = styled.div`
  background: var(--tp-bg-surface);
  border-right: 1px solid var(--tp-border);
  padding: 8px 4px 8px 12px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--tp-text-muted);
  text-align: right;
  overflow-y: auto;
  user-select: none;
`;

const LineNumber = styled.div<{ $highlighted: boolean; $current: boolean }>`
  padding: 0 4px;
  background: ${({ $highlighted, $current }) =>
    $current ? "var(--tp-active-color)" : $highlighted ? "var(--tp-highlight)" : "transparent"};
  color: ${({ $current }) => ($current ? "#fff" : "inherit")};
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
  color: var(--tp-text);
  background: var(--tp-bg);
  resize: none;
  white-space: ${({ $wordWrap }) => ($wordWrap ? "pre-wrap" : "pre")};
  overflow-wrap: ${({ $wordWrap }) => ($wordWrap ? "break-word" : "normal")};
  overflow-x: ${({ $wordWrap }) => ($wordWrap ? "hidden" : "auto")};
  overflow-y: auto;
  tab-size: 2;

  &::selection {
    background: var(--tp-selection);
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: var(--tp-bg-surface);
  border-top: 1px solid var(--tp-border);
  font-size: 11px;
  color: var(--tp-text-muted);
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
