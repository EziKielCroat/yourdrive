import React, { useId, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import styled from "styled-components";
import { T } from "./editor.tokens";

let mermaidInit: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid() {
  if (!mermaidInit) {
    mermaidInit = import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        fontFamily: "system-ui, -apple-system, sans-serif",
        theme: "base",
        themeVariables: {
          primaryColor: "#e8f0fe",
          primaryTextColor: "var(--ed-textPrimary, #0f172a)",
          primaryBorderColor: "#b8c5db",
          lineColor: "#64748b",
          secondaryColor: "#f1f5f9",
          tertiaryColor: "#f8fafc",
          mainBkg: "#ffffff",
          nodeBorder: "#cbd5e1",
          clusterBkg: "#f1f5f9",
          titleColor: "var(--ed-textPrimary, #0f172a)",
          edgeLabelBackground: "#ffffff",
          fontSize: "13px",
        },
        flowchart: { curve: "basis", padding: 8 },
        sequence: { useMaxWidth: true },
        gantt: { useMaxWidth: true },
      });
      return m.default;
    });
  }
  return mermaidInit;
}

const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const id = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !code.trim()) return;
    let cancelled = false;
    (async () => {
      const m = await loadMermaid();
      if (cancelled) return;
      const rid = `mmd-${id}-${Math.random().toString(36).slice(2, 9)}`;
      try {
        const { svg } = await m.render(rid, code);
        if (cancelled || !el) return;
        el.innerHTML = svg;
      } catch {
        if (!el || cancelled) return;
        el.innerHTML = "";
        const err = document.createElement("p");
        err.textContent = "Dijagram se ne može prikazati. Provjeri mermaid syntaksu.";
        err.setAttribute("role", "status");
        el.appendChild(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  return <MermaidWrap ref={wrapRef} role="img" aria-label="Diagram" />;
};

const ProseRoot = styled.div`
  font-family: ${T.fontUI};
  font-size: 12.5px;
  line-height: 1.6;
  color: ${T.textPrimary};
  word-break: break-word;

  & > *:first-child {
    margin-top: 0;
  }
  & > *:last-child {
    margin-bottom: 0;
  }

  p {
    margin: 0.4rem 0;
  }

  h1, h2, h3, h4 {
    font-weight: 600;
    line-height: 1.3;
    margin: 0.6rem 0 0.35rem;
    color: ${T.textPrimary};
    letter-spacing: -0.01em;
  }
  h3 { font-size: 1.05em; }
  h4 { font-size: 1em; }

  strong { font-weight: 600; color: ${T.textPrimary}; }
  em { font-style: italic; }

  a {
    color: ${T.accentHover};
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }

  ul, ol {
    margin: 0.35rem 0 0.5rem 1.15rem;
    padding: 0;
    color: ${T.textSecondary};
  }
  li { margin: 0.2rem 0; }

  blockquote {
    margin: 0.45rem 0;
    padding: 0.4rem 0.55rem 0.4rem 0.7rem;
    border-left: 3px solid ${T.borderSubtle};
    background: ${T.bgBase};
    color: ${T.textSecondary};
    border-radius: 0 ${T.rSm} ${T.rSm} 0;
  }

  hr {
    border: none;
    border-top: 1px solid ${T.borderFaint};
    margin: 0.65rem 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95em;
    margin: 0.45rem 0;
  }
  th, td {
    border: 1px solid ${T.borderFaint};
    padding: 0.35rem 0.5rem;
    text-align: left;
  }
  th {
    background: ${T.bgBase};
    font-weight: 600;
    color: ${T.textPrimary};
  }

  .inline-code, code {
    font-family: ${T.fontMono};
    font-size: 0.88em;
  }
`;

const InlineCode = styled.code`
  background: ${T.bgBase};
  border: 1px solid ${T.borderFaint};
  border-radius: 4px;
  padding: 0.1em 0.35em;
  color: ${T.textCode};
`;

const BlockPre = styled.pre`
  margin: 0.45rem 0;
  padding: 0.55rem 0.7rem;
  background: #0d1117;
  color: #e6edf3;
  border: 1px solid ${T.borderFaint};
  border-radius: ${T.rMd};
  overflow-x: auto;
  font-size: 0.86em;
  line-height: 1.5;

  code {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
  }
`;

const MermaidWrap = styled.div`
  margin: 0.5rem 0;
  padding: 0.5rem 0.35rem;
  background: ${T.bgBase};
  border: 1px solid ${T.borderFaint};
  border-radius: ${T.rMd};
  overflow-x: auto;

  svg {
    max-width: 100%;
    height: auto;
  }

  p {
    color: ${T.textMuted};
    font-size: 0.9em;
    margin: 0.25rem 0 0;
  }
`;

function CodeBlock({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"code">) {
  const str = String(children).replace(/\n$/, "");
  if (!className) {
    return <InlineCode className="inline-code" {...rest}>{children}</InlineCode>;
  }
  const match = /language-(\w+)/.exec(className);
  const lang = match?.[1] ?? "";
  if (lang === "mermaid") {
    return <MermaidDiagram code={str} />;
  }
  return (
    <BlockPre>
      <code className={className} {...rest}>
        {children}
      </code>
    </BlockPre>
  );
}

const markdownPlugins = [remarkGfm];
const rehypePlugins = [rehypeSanitize];

export type AiAssistantMarkdownProps = {
  text: string;
  className?: string;
};

/**
 * Renders AI assistant output as GFM: **bold**, *italic*, lists, tables, mermaid, code.
 */
export const AiAssistantMarkdown: React.FC<AiAssistantMarkdownProps> = ({
  text,
  className,
}) => {
  if (!text?.trim()) return null;
  return (
    <ProseRoot className={className}>
      <ReactMarkdown
        remarkPlugins={markdownPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          // Avoid <pre><pre> for fenced blocks; our CodeBlock outputs <pre> for code.
          pre: ({ children }) => <>{children}</>,
          code: CodeBlock,
        }}
      >
        {text}
      </ReactMarkdown>
    </ProseRoot>
  );
};

export default AiAssistantMarkdown;
