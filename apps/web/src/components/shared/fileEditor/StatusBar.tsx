import React, { useMemo } from "react";
import styled from "styled-components";
import { T } from "./editor.tokens";

interface StatusBarProps {
  content: string;
  selectionStart: number;
  mimeType?: string;
  isDirty: boolean;
}

function computeLineCol(text: string, offset: number): { line: number; col: number } {
  const slice = text.slice(0, offset);
  const lines = slice.split("\n");
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function shortMime(mime?: string): string {
  if (!mime) return "plain text";
  const map: Record<string, string> = {
    "text/plain": "plain text",
    "text/html": "HTML",
    "text/css": "CSS",
    "text/javascript": "JavaScript",
    "application/javascript": "JavaScript",
    "application/json": "JSON",
    "application/xml": "XML",
    "text/markdown": "Markdown",
    "text/x-python": "Python",
    "text/x-c": "C",
    "text/x-c++": "C++",
    "text/x-java-source": "Java",
    "text/x-rust": "Rust",
    "text/x-go": "Go",
    "text/x-sh": "Shell",
    "text/x-yaml": "YAML",
    "text/x-toml": "TOML",
  };
  return map[mime.toLowerCase()] ?? mime.split("/")[1]?.toUpperCase() ?? mime;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  content,
  selectionStart,
  mimeType,
  isDirty,
}) => {
  const { line, col } = useMemo(
    () => computeLineCol(content, selectionStart),
    [content, selectionStart],
  );
  const words = useMemo(() => countWords(content), [content]);
  const chars = content.length;
  const fileType = shortMime(mimeType);

  return (
    <Bar>
      <BarLeft>
        <Stat title="Line and column">
          Ln {line}, Col {col}
        </Stat>
        <Divider />
        <Stat title="Word count">{words.toLocaleString()} words</Stat>
        <Divider />
        <Stat title="Character count">{chars.toLocaleString()} chars</Stat>
      </BarLeft>
      <BarRight>
        <Stat>{fileType}</Stat>
        <Divider />
        <Stat>UTF-8</Stat>
        <Divider />
        <ModifiedTag $dirty={isDirty}>{isDirty ? "● Modified" : "Saved"}</ModifiedTag>
      </BarRight>
    </Bar>
  );
};

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  padding: 0 14px;
  background: ${T.bgElevated};
  border-top: 1px solid ${T.borderFaint};
  flex-shrink: 0;
  user-select: none;
`;

const BarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

const BarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
`;

const Stat = styled.span`
  font-family: ${T.fontUI};
  font-size: 12px;
  color: ${T.textMuted};
  padding: 0 8px;
  line-height: 28px;
  white-space: nowrap;
`;

const Divider = styled.span`
  width: 1px;
  height: 12px;
  background: ${T.borderFaint};
  flex-shrink: 0;
`;

const ModifiedTag = styled.span<{ $dirty: boolean }>`
  font-family: ${T.fontUI};
  font-size: 12px;
  padding: 0 8px;
  line-height: 28px;
  color: ${(p) => (p.$dirty ? T.warningText : T.textMuted)};
  transition: color ${T.tBase};
`;

export default StatusBar;
