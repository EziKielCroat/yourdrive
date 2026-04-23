import React, { useCallback, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { DownloadIcon as Download, SearchIcon as Search, CopyIcon as Copy, CodeIcon as Code, HashIcon as Hash, TypeIcon as Type } from "../../../icons/index";
import Prism from "prismjs";
import api from "../../../../../lib/axios";
import "prismjs/themes/prism.css";
// Required by several Prism languages (php, etc.) to avoid tokenizePlaceholders crash
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-php";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";
import "prismjs/components/prism-markup";

interface CodePreviewProps {
  url: string;
  fileName: string;
  mimeType?: string;
  onDownload?: () => void;
  onError?: (error: string) => void;
  headers?: Record<string, string>;
}

const languageMap: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  cs: "csharp",
  go: "go",
  rs: "rust",
  php: "php",
  rb: "ruby",
  swift: "swift",
  kt: "kotlin",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  html: "markup",
  htm: "markup",
  css: "css",
  scss: "scss",
  sass: "scss",
  xml: "markup",
};

const CodePreview: React.FC<CodePreviewProps> = ({
  url,
  fileName,
  onDownload,
  onError,
  headers,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("plaintext");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const codeRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

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

  const loadFile = useCallback(async () => {
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
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(arrayBuffer);

      setContent(text);

      // Detect language from file extension
      const extension = fileName.toLowerCase().split(".").pop() || "";
      const detectedLanguage = languageMap[extension] || "plaintext";
      setLanguage(detectedLanguage);

      setLoading(false);
    } catch {
      setError("Failed to load code file");
      onError?.("Failed to load code file");
      setLoading(false);
    }
  }, [fileName, headers, onError, url]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  useEffect(() => {
    if (content && language !== "plaintext") {
      try {
        Prism.highlightAll();
      } catch (e) {
        // If Prism crashes on a language definition, fail gracefully
        console.error("Prism highlight failed:", e);
      }
    }
  }, [content, language, theme]);

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
    const lineHeight = fontSize * 1.5;
    const scrollTop = lineNumber * lineHeight;

    if (preRef.current) {
      preRef.current.scrollTop = scrollTop - 100;
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

  const handleFontSizeChange = (delta: number) => {
    setFontSize((prev) => Math.max(8, Math.min(24, prev + delta)));
  };

  const stats = {
    lines: content.split("\n").length,
    characters: content.length,
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading code file...</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>⚠️</ErrorIcon>
        <h3>Unable to load code file</h3>
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
    <Container $theme={theme}>
      <Toolbar $theme={theme}>
        <LeftControls>
          <LanguageSelector $theme={theme}>
            <Code size={16} />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="plaintext">Plain Text</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
              <option value="markup">HTML/XML</option>
              <option value="css">CSS</option>
              <option value="scss">SCSS</option>
            </select>
          </LanguageSelector>

          <FontSizeControls>
            <FontSizeButton $theme={theme} onClick={() => handleFontSizeChange(-1)}>
              -
            </FontSizeButton>
            <FontSizeDisplay $theme={theme}>{fontSize}px</FontSizeDisplay>
            <FontSizeButton $theme={theme} onClick={() => handleFontSizeChange(1)}>
              +
            </FontSizeButton>
          </FontSizeControls>

          <ThemeToggle
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </ThemeToggle>
        </LeftControls>

        <SearchBox $theme={theme}>
          <Search size={16} />
          <SearchInput
            $theme={theme}
            type="text"
            placeholder="Search in code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyPress}
          />
          {searchTerm && (
            <SearchResults $theme={theme}>
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

        <RightControls>
          <ToolbarButton
            $theme={theme}
            $active={showLineNumbers}
            onClick={() => setShowLineNumbers(!showLineNumbers)}
          >
            <Hash size={16} />
          </ToolbarButton>

          <ToolbarButton
            $theme={theme}
            $active={wordWrap}
            onClick={() => setWordWrap(!wordWrap)}
          >
            <Type size={16} />
          </ToolbarButton>

          <ToolbarButton $theme={theme} onClick={handleCopy}>
            <Copy size={16} />
          </ToolbarButton>

          {onDownload && (
            <ToolbarButton $theme={theme} $primary onClick={onDownload}>
              <Download size={16} />
            </ToolbarButton>
          )}
        </RightControls>
      </Toolbar>

      <CodeContainer $theme={theme}>
        {showLineNumbers && (
          <LineNumbers $theme={theme} $fontSize={fontSize}>
            {content.split("\n").map((_, index) => (
              <LineNumber
                key={index + 1}
                $theme={theme}
                $highlighted={searchResults.includes(index)}
                $current={searchResults[currentSearchIndex] === index}
              >
                {index + 1}
              </LineNumber>
            ))}
          </LineNumbers>
        )}

        <CodeWrapper
          ref={codeRef}
          $hasLineNumbers={showLineNumbers}
          $fontSize={fontSize}
          $wordWrap={wordWrap}
        >
          <pre
            ref={preRef}
            style={{
              fontSize: `${fontSize}px`,
              whiteSpace: wordWrap ? "pre-wrap" : "pre",
              overflowWrap: wordWrap ? "break-word" : "normal",
            }}
          >
            <code className={`language-${language}`}>{content}</code>
          </pre>
        </CodeWrapper>
      </CodeContainer>

      <StatusBar $theme={theme}>
        <Stats>
          <StatItem>{stats.lines} lines</StatItem>
          <StatItem>
            <span>•</span>
            {stats.characters} characters
          </StatItem>
          <StatItem>
            <span>•</span>
            {language}
          </StatItem>
        </Stats>

        <FileInfo>{fileName} • UTF-8</FileInfo>
      </StatusBar>
    </Container>
  );
};

const Container = styled.div<{ $theme: "light" | "dark" }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ $theme }) => ($theme === "dark" ? "#1e1e1e" : "#ffffff")};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  background: #1e1e1e;
  color: white;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
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

const Toolbar = styled.div<{ $theme: "light" | "dark" }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${({ $theme }) => ($theme === "dark" ? "#2d2d30" : "#f8f9fa")};
  border-bottom: 1px solid
    ${({ $theme }) => ($theme === "dark" ? "#3e3e42" : "#dadce0")};
  gap: 12px;
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LanguageSelector = styled.div<{ $theme: "light" | "dark" }>`
  display: flex;
  align-items: center;
  gap: 8px;

  select {
    background: ${({ $theme }) => ($theme === "dark" ? "#2d2d30" : "white")};
    border: 1px solid ${({ $theme }) => ($theme === "dark" ? "#3e3e42" : "#dadce0")};
    color: ${({ $theme }) => ($theme === "dark" ? "#cccccc" : "#202124")};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;

    &:focus {
      outline: none;
    }
  }
`;

const FontSizeControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FontSizeButton = styled.button<{ $theme: "light" | "dark" }>`
  width: 24px;
  height: 24px;
  background: ${({ $theme }) => ($theme === "dark" ? "#3e3e42" : "white")};
  border: none;
  color: ${({ $theme }) => ($theme === "dark" ? "#cccccc" : "#202124")};
  border: 1px solid ${({ $theme }) => ($theme === "dark" ? "#3e3e42" : "#dadce0")};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ $theme }) => ($theme === "dark" ? "#4a4a4f" : "#f8f9fa")};
  }
`;

const FontSizeDisplay = styled.span<{ $theme: "light" | "dark" }>`
  font-size: 12px;
  color: ${({ $theme }) => ($theme === "dark" ? "#cccccc" : "#5f6368")};
  min-width: 40px;
  text-align: center;
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: #cccccc;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const SearchBox = styled.div<{ $theme: "light" | "dark" }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #dadce0;
  border-radius: 4px;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input<{ $theme: "light" | "dark" }>`
  border: none;
  outline: none;
  flex: 1;
  font-size: 12px;
  background: transparent;
  color: ${({ $theme }) => ($theme === "dark" ? "#cccccc" : "#202124")};

  &::placeholder {
    color: #9aa0a6;
  }
`;

const SearchResults = styled.div<{ $theme: "light" | "dark" }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ $theme }) => ($theme === "dark" ? "#9aa0a6" : "#5f6368")};
  white-space: nowrap;
`;

const SearchNavButton = styled.button`
  background: none;
  border: none;
  color: #9aa0a6;
  cursor: pointer;
  font-size: 10px;
  padding: 2px 4px;

  &:hover {
    color: #cccccc;
  }
`;

const RightControls = styled.div`
  display: flex;
  gap: 4px;
`;

const ToolbarButton = styled.button<{
  $theme: "light" | "dark";
  $active?: boolean;
  $primary?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid
    ${({ $theme, $active, $primary }) =>
      $primary
        ? "#1a73e8"
        : $active
          ? "#1a73e8"
          : $theme === "dark"
            ? "#3e3e42"
            : "#dadce0"};
  background: ${({ $theme, $active, $primary }) =>
    $primary
      ? "#1a73e8"
      : $active
        ? $theme === "dark"
          ? "#1a73e8"
          : "#e8f0fe"
        : "transparent"};
  color: ${({ $theme, $active, $primary }) =>
    $primary
      ? "white"
      : $active
        ? $theme === "dark"
          ? "white"
          : "#1a73e8"
        : $theme === "dark"
          ? "#cccccc"
          : "#202124"};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${({ $theme, $active, $primary }) =>
      $primary
        ? "#0d62d9"
        : $active
          ? $theme === "dark"
            ? "#0d62d9"
            : "#d2e3fc"
          : $theme === "dark"
            ? "#3e3e42"
            : "#f8f9fa"};
  }
`;

const CodeContainer = styled.div<{ $theme: "light" | "dark" }>`
  flex: 1;
  overflow: hidden;
  display: flex;
  background: ${({ $theme }) => ($theme === "dark" ? "#1e1e1e" : "#ffffff")};
`;

const LineNumbers = styled.div<{ $theme: "light" | "dark"; $fontSize: number }>`
  background: ${({ $theme }) => ($theme === "dark" ? "#1e1e1e" : "#f8f9fa")};
  border-right: 1px solid
    ${({ $theme }) => ($theme === "dark" ? "#2d2d30" : "#dadce0")};
  padding: 8px 4px 8px 12px;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: ${({ $fontSize }) => $fontSize}px;
  line-height: ${({ $fontSize }) => $fontSize * 1.5}px;
  color: ${({ $theme }) => ($theme === "dark" ? "#858585" : "#5f6368")};
  text-align: right;
  overflow-y: auto;
  user-select: none;
`;

const LineNumber = styled.div<{
  $theme: "light" | "dark";
  $highlighted: boolean;
  $current: boolean;
}>`
  padding: 0 4px;
  background: ${({ $highlighted, $current, $theme }) => {
    if ($current) return "#1a73e8";
    if ($highlighted) return $theme === "dark" ? "#2a2d2e" : "#fef7e0";
    return "transparent";
  }};
  color: ${({ $current }) => ($current ? "white" : "inherit")};
  border-radius: 2px;
  margin-bottom: 1px;
`;

const CodeWrapper = styled.div<{
  $hasLineNumbers: boolean;
  $fontSize: number;
  $wordWrap: boolean;
}>`
  flex: 1;
  overflow: auto;
  position: relative;

  pre {
    margin: 0;
    padding: 8px 12px;
    overflow: visible;
    background: transparent !important;
  }

  code {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    line-height: ${({ $fontSize }) => $fontSize * 1.5}px;
    tab-size: 2;
  }
`;

const StatusBar = styled.div<{ $theme: "light" | "dark" }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: ${({ $theme }) => ($theme === "dark" ? "#007acc" : "#f8f9fa")};
  border-top: 1px solid
    ${({ $theme }) => ($theme === "dark" ? "#3e3e42" : "#dadce0")};
  font-size: 11px;
  color: ${({ $theme }) => ($theme === "dark" ? "#ffffff" : "#5f6368")};
  min-height: 22px;
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

const FileInfo = styled.div`
  font-style: italic;
  opacity: 0.8;
`;

export default CodePreview;
