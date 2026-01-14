import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Download, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { getLanguageFromExtension } from "../../utils/FileTypeDetector";

interface CodeEditorProps {
  url: string;
  fileName: string;
  onEdit?: (content: string) => void;
  onDownload?: () => void;
}

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
`;

const Button = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.$primary
      ? `
    color: white;
    background: #0e639c;
    
    &:hover {
      background: #1177bb;
    }
  `
      : `
    color: #cccccc;
    background: #3e3e42;
    
    &:hover {
      background: #505052;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  outline: none;
  resize: none;
  tab-size: 2;

  &::selection {
    background: #264f78;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.75rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  color: #f48771;
  padding: 2rem;
  text-align: center;
`;

const IconWrapper = styled.div<{ $spinning?: boolean }>`
  width: 2rem;
  height: 2rem;
  color: ${(props) => (props.$spinning ? "#0e639c" : "currentColor")};

  ${(props) =>
    props.$spinning &&
    `
    svg {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `}

  svg {
    width: 100%;
    height: 100%;
  }
`;

const Text = styled.p<{ $size?: string }>`
  font-size: ${(props) => props.$size || "0.875rem"};
  color: #cccccc;
  margin: 0;
`;

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3.5rem;
  background: #1e1e1e;
  padding: 1.5rem 0;
  overflow: hidden;
  user-select: none;
  pointer-events: none;
  border-right: 1px solid #3e3e42;
`;

const LineNumber = styled.div`
  height: 1.6em;
  padding-right: 0.5rem;
  text-align: right;
  color: #858585;
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 14px;
  line-height: 1.6;
`;

const CorsWarning = styled.div`
  background: #3e3e42;
  border: 1px solid #858585;
  border-radius: 0.25rem;
  padding: 1rem;
  max-width: 500px;
  margin-top: 1rem;
`;

const WarningTitle = styled.div`
  color: #cccccc;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const WarningText = styled.div`
  color: #cccccc;
  font-size: 0.875rem;
  line-height: 1.5;
`;

export default function CodeEditor({
  url,
  fileName,
  onEdit,
  onDownload,
}: CodeEditorProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorsError, setIsCorsError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const language = getLanguageFromExtension(fileName);

  useEffect(() => {
    loadFile();
  }, [url]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    setIsCorsError(false);

    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load file: ${response.status} ${response.statusText}`
        );
      }

      const text = await response.text();
      setContent(text);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load file";

      // Check if it's a CORS error
      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("NetworkError") ||
        (err instanceof TypeError && err.message.includes("Failed to fetch"))
      ) {
        setIsCorsError(true);
        setError("Unable to load file due to CORS restrictions");
      } else {
        setError(errorMessage);
      }

      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsDirty(true);
    onEdit?.(newContent);
  };

  const handleSave = () => {
    if (onEdit && isDirty) {
      onEdit(content);
      setIsDirty(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent =
        content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  };

  const handleOpenInNewTab = () => {
    window.open(url, "_blank");
  };

  const lineCount = content.split("\n").length;

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <IconWrapper $spinning>
            <Loader2 />
          </IconWrapper>
          <Text>Loading file...</Text>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <IconWrapper>
            <AlertCircle />
          </IconWrapper>
          <Text $size="1.125rem">Unable to preview file</Text>
          <Text>{error}</Text>

          {isCorsError && (
            <CorsWarning>
              <WarningTitle>CORS Restriction</WarningTitle>
              <WarningText>
                The file storage service doesn't allow direct preview in the
                browser. You can download the file to view it locally or open it
                in a new tab.
              </WarningText>
            </CorsWarning>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <Button $primary onClick={handleOpenInNewTab}>
              <ExternalLink size={16} />
              Open in new tab
            </Button>
            {onDownload && (
              <Button onClick={onDownload}>
                <Download size={16} />
                Download file
              </Button>
            )}
          </div>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <EditorContainer>
        <LineNumbers>
          {Array.from({ length: lineCount }, (_, i) => (
            <LineNumber key={i + 1}>{i + 1}</LineNumber>
          ))}
        </LineNumbers>
        <TextArea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={!onEdit}
          spellCheck={false}
          style={{ paddingLeft: "4.5rem" }}
        />
      </EditorContainer>
    </Container>
  );
}
