import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  type RefObject,
} from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  SendIcon as Send,
  SquareIcon as Square,
  Trash2Icon as Trash2,
  BotIcon as Bot,
  ClipboardCopyIcon as ClipboardCopy,
  CornerDownLeftIcon as CornerDownLeft,
  SparklesIcon as Sparkles,
  ChevronDownIcon as ChevronDown,
} from "../icons/index";
import { streamChat, getBackendLabel, type ChatMessage } from "../../../services/luService";
import { buildSystemPromptWithLanguage } from "../../../lib/languageDetect";
import { buildEditorDocumentForPrompt } from "../../../lib/editorAiContext";
import { EDITOR_PLATFORM_KNOWLEDGE_BLOCK } from "../../../lib/editorPlatformKnowledge";
import { guardFilter } from "../../../lib/guardFilter";
import { T } from "./editor.tokens";
import { AiAssistantMarkdown } from "./AiAssistantMarkdown";

const BASE_SYSTEM_PROMPT = `You are a concise in-editor helper for NexaCore/YourDrive. **Hard limits (obey all):**
1) **Default length** — for app / product questions: about **40–100 words** total: one short paragraph and/or up to **4** bullet lines. For rewriting or continuing the open document: you may go longer, but still **no** filler, no “spirals”, no multiple unrelated sections.
2) **No tangents** — one user question = one answer on that topic. Do not add “by the way”, “also consider”, “related idea”, or a second mini-essay.
3) **No stacked structure** — at most **one** \`###\` line. **Forbidden:** “Summary / Conclusion / Additional tips / Key takeaways” blocks. Do not rephrase the same point twice.
4) **No soft openers** — never start with: “Great question”, “Certainly”, “I’d be happy to”, “Let me help”, “The short answer is…”, or similar. Start with the **answer**.
5) **End cleanly** — when done, **stop**. No “Let me know if…”, no list of 5 more options, no “If you want, we could also…”, no extra follow-up questions unless the request was genuinely ambiguous.
6) **Clarification** — if you must ask something, at most **one** short question; if the user was clear, ask **nothing**.
7) **Format** — compact **GitHub-Flavored Markdown** (\`**bold**\`, \`-\` list or numbered steps). Mini table only for a tiny comparison. Mermaid only if ≤ few lines; else skip. Normal \` \`\` \` \` for code.

**Truth** — use only the platform + help text below. **VERBATIM WORKFLOWS** keep **step order**. No invented numbers; if unsure, say **check Settings** / **Help**. Match the user’s language.

**Open file** — use the file snapshot; don’t guess missing text.`;

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  streaming?: boolean;
}

interface AiChatPanelProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onInsert: (text: string) => void;
  fileName: string;
  mimeType?: string;
  documentContent: string;
  selectionStart: number;
  selectionEnd: number;
  /** Live editor selection (refreshed as the user drags) */
  selectedText: string;
}

const TypingDots: React.FC = () => (
  <DotsWrap aria-label="AI is thinking">
    <Dot style={{ animationDelay: "0ms" }} />
    <Dot style={{ animationDelay: "150ms" }} />
    <Dot style={{ animationDelay: "300ms" }} />
  </DotsWrap>
);

export const AiChatPanel: React.FC<AiChatPanelProps> = ({
  textareaRef,
  onInsert,
  fileName,
  mimeType,
  documentContent,
  selectionStart,
  selectionEnd,
  selectedText,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  /** When false, new tokens must NOT auto-scroll the list (user is reading up). */
  const pinToBottomRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const backendLabel = getBackendLabel();

  useEffect(() => {
    const t = (selectedText || "").trim();
    if (t) {
      const clip = t.length > 6_000 ? `${t.slice(0, 6_000)}\n\n[…selekcija skraćena…]` : t;
      setPrompt(
        `Poboljšaj, objasni ili proširi ovo, u skladu s ostatkom dokumenta gore u kontekstu:\n\n${clip}`,
      );
      setTimeout(() => promptRef.current?.focus(), 100);
    }
  // only when the panel mounts (AI opened)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinToBottomRef.current = true;
    el.scrollTop = el.scrollHeight;
    setAtBottom(true);
  }, []);

  const handleListScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (gap < 6) {
      pinToBottomRef.current = true;
      setAtBottom(true);
    } else if (gap > 48) {
      pinToBottomRef.current = false;
      setAtBottom(false);
    }
  }, []);

  useEffect(() => {
    if (!pinToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      if (!pinToBottomRef.current) return;
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [messages, streaming]);

  const send = useCallback(() => {
    const text = prompt.trim();
    if (!text || streaming) return;

    const guard = guardFilter(text);
    if (guard.blocked) {
      setError(guard.reason ?? "Request blocked.");
      return;
    }

    setError(null);
    const assistantId = `a-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);
    setPrompt("");
    setStreaming(true);
    pinToBottomRef.current = true;
    setAtBottom(true);
    setTimeout(scrollToBottom, 30);

    const history: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: "user", content: text });

    const fileSnapshot = buildEditorDocumentForPrompt(
      documentContent,
      selectionStart,
      selectionEnd,
      fileName,
      mimeType,
    );
    const systemPrompt = buildSystemPromptWithLanguage(
      `${BASE_SYSTEM_PROMPT}

--- Platform & help reference (use for Q&A; do not invent beyond this) ---
${EDITOR_PLATFORM_KNOWLEDGE_BLOCK}

--- Current file (for writing tasks; do not echo it back unless asked) ---
${fileSnapshot}`,
      `${text}\n\n${documentContent.slice(0, 1_500)}`,
    );

    abortRef.current = streamChat(
      [{ role: "system", content: systemPrompt }, ...history],
      {
        onChunk: (delta) =>
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + delta } : m,
            ),
          ),
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m,
            ),
          );
          setStreaming(false);
          abortRef.current = null;
        },
        onError: (msg) => {
          setError(msg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || "(no response)", streaming: false }
                : m,
            ),
          );
          setStreaming(false);
          abortRef.current = null;
        },
      },
      {
        /* Tight cap + low temperature: fewer rambles; raise VITE_LU_MAX_TOKENS in .env to allow longer in-editor drafts */
        maxTokens: 520,
        temperature: 0.3,
      },
    );
  }, [
    prompt,
    streaming,
    messages,
    scrollToBottom,
    documentContent,
    selectionStart,
    selectionEnd,
    fileName,
    mimeType,
  ]);

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  };

  const clearChat = () => {
    if (streaming) stop();
    setMessages([]);
    setError(null);
    pinToBottomRef.current = true;
    setAtBottom(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <PanelWrapper
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "clamp(290px, 32%, 420px)", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <PanelInner>
        <PanelHeader>
          <HeaderLeft>
            <HeaderIconWrap>
              <Sparkles size={13} strokeWidth={2.2} />
            </HeaderIconWrap>
            <HeaderTitle>Osobni asistent</HeaderTitle>
          </HeaderLeft>
          <HeaderRight>
            <BackendPill>{backendLabel}</BackendPill>
            {messages.length > 0 && (
              <IconBtn onClick={clearChat} title="Clear conversation">
                <Trash2 size={13} />
              </IconBtn>
            )}
          </HeaderRight>
        </PanelHeader>

        <MessageList
          ref={scrollRef}
          onScroll={handleListScroll}
          onWheel={(e) => e.stopPropagation()}
        >
          <DocContextBanner>
            <span>{fileName}</span>
            {documentContent.length > 0 && (
              <DocMeta>
                {documentContent.length.toLocaleString()} znakova
                {selectionEnd > selectionStart && (
                  <> · odabir: {(selectionEnd - selectionStart).toLocaleString()}</>
                )}
              </DocMeta>
            )}
          </DocContextBanner>
          {messages.length === 0 && (
            <EmptyState>
              <EmptyOrb>
                <Bot size={20} strokeWidth={1.5} />
              </EmptyOrb>
              <EmptyTitle>Asistent u dokumentu</EmptyTitle>
              <EmptyBody>
                Cijela datoteka (ili izvadak kod velikih) šalje se u svakom upitu.
                Odabir u editoru naglašavaš u poruci; gumbom umetnite odgovor u tekst.
              </EmptyBody>
              <HintRow>
                <HintChip><CornerDownLeft size={10} /> Enter</HintChip>
                <HintText>to send</HintText>
                <HintChip>Shift+Enter</HintChip>
                <HintText>new line</HintText>
              </HintRow>
            </EmptyState>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <UserMessage key={msg.id}>
                <UserBubble>{msg.content}</UserBubble>
              </UserMessage>
            ) : (
              <AssistantMessage key={msg.id}>
                <AssistantBubble>
                  {!msg.content && msg.streaming && <TypingDots />}
                  {msg.content ? (
                    <AssistantMdWrap
                      $streaming={Boolean(msg.streaming)}
                      aria-live={msg.streaming ? "polite" : "off"}
                    >
                      <AiAssistantMarkdown text={msg.content} />
                    </AssistantMdWrap>
                  ) : null}
                  {msg.streaming && msg.content ? <Caret /> : null}
                </AssistantBubble>
                {!msg.streaming && msg.content && (
                  <ActionRow>
                    <InsertBtn
                      onClick={() => {
                        onInsert(msg.content);
                        textareaRef.current?.focus();
                      }}
                      title="Umeće na mjesto kursora; ako je nešto odabrano, to zamijenjuje"
                    >
                      <CornerDownLeft size={11} />
                      Umetni u dokument
                    </InsertBtn>
                    <CopyBtn
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      title="Copy to clipboard"
                    >
                      <ClipboardCopy size={11} />
                    </CopyBtn>
                  </ActionRow>
                )}
              </AssistantMessage>
            ),
          )}

          {error && (
            <ErrorBanner>
              <span>{error}</span>
              <ErrorDismiss onClick={() => setError(null)}>✕</ErrorDismiss>
            </ErrorBanner>
          )}
          {!atBottom && messages.length > 0 && (
            <ScrollLatestBtn
              type="button"
              onClick={() => {
                pinToBottomRef.current = true;
                scrollToBottom();
              }}
              title="Najnovija poruka"
            >
              <ChevronDown size={14} />
              <span>Najnovije</span>
            </ScrollLatestBtn>
          )}
        </MessageList>

        <InputArea>
          {selectedText.trim() && (
            <ContextChip>
              <span>Odabir u editoru · </span>
              {selectedText.slice(0, 64)}
              {selectedText.length > 64 && "…"}
            </ContextChip>
          )}
          <PromptTextarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Enter to send)"
            rows={3}
            disabled={streaming}
          />
          <InputFooter>
            {streaming ? (
              <StopBtn onClick={stop}>
                <Square size={11} fill="currentColor" />
                Stop
              </StopBtn>
            ) : (
              <SendBtn onClick={send} disabled={!prompt.trim()}>
                <Send size={12} />
                Send
              </SendBtn>
            )}
          </InputFooter>
        </InputArea>
      </PanelInner>
    </PanelWrapper>
  );
};

// ── Styled components ──────────────────────────────────────────────────────

const PanelWrapper = styled(motion.div)`
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  align-self: stretch;
  border-left: 1px solid ${T.borderFaint};
  background: ${T.bgSurface};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PanelInner = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  min-width: 270px;
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: ${T.bgElevated};
  border-bottom: 1px solid ${T.borderFaint};
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderIconWrap = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${T.rMd};
  background: ${T.accentFaint};
  border: 1px solid rgba(37,99,235,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${T.accentHover};
  flex-shrink: 0;
`;

const HeaderTitle = styled.span`
  font-family: ${T.fontUI};
  font-size: 13px;
  font-weight: 600;
  color: ${T.textPrimary};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BackendPill = styled.span`
  font-family: ${T.fontUI};
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: ${T.rFull};
  background: ${T.accentFaint};
  color: ${T.accentHover};
  border: 1px solid rgba(37,99,235,0.2);
  letter-spacing: 0.03em;
  text-transform: uppercase;
`;

const IconBtn = styled.button`
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  border-radius: ${T.rMd};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${T.textMuted};
  transition: background ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    color: ${T.dangerText};
  }
`;

const MessageList = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb { background: ${T.borderSubtle}; border-radius: 3px; }
`;

const ScrollLatestBtn = styled.button`
  position: absolute;
  right: 10px;
  bottom: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: ${T.rFull};
  border: 1px solid ${T.borderSubtle};
  background: ${T.bgElevated};
  color: ${T.textSecondary};
  font-family: ${T.fontUI};
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${T.shadowSm};
  transition: background ${T.tFast}, color ${T.tFast}, border-color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    color: ${T.textPrimary};
    border-color: ${T.borderStrong};
  }
`;

const AssistantMdWrap = styled.div<{ $streaming: boolean }>`
  opacity: ${(p) => (p.$streaming ? 0.95 : 1)};
  max-width: 100%;

  p:last-child {
    margin-bottom: 0;
  }
`;

const DocContextBanner = styled.div`
  flex-shrink: 0;
  font-family: ${T.fontUI};
  font-size: 11.5px;
  line-height: 1.4;
  padding: 8px 10px;
  border-radius: ${T.rMd};
  background: ${T.accentFaint};
  border: 1px solid rgba(37, 99, 235, 0.22);
  color: ${T.textPrimary};

  span:first-child {
    font-weight: 600;
    display: block;
  }
`;

const DocMeta = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 10.5px;
  color: ${T.textSecondary};
  font-weight: 500;
`;

const EmptyState = styled.div`
  margin: auto;
  text-align: center;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const EmptyOrb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${T.rLg};
  background: ${T.accentFaint};
  border: 1px solid rgba(37,99,235,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${T.accentHover};
`;

const EmptyTitle = styled.p`
  font-family: ${T.fontUI};
  font-size: 13px;
  font-weight: 600;
  color: ${T.textPrimary};
  margin: 0;
`;

const EmptyBody = styled.p`
  font-family: ${T.fontUI};
  font-size: 12px;
  line-height: 1.65;
  color: ${T.textSecondary};
  max-width: 220px;
  margin: 0;
`;

const HintRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
`;

const HintChip = styled.kbd`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: ${T.fontUI};
  font-size: 10px;
  padding: 2px 6px;
  border-radius: ${T.rSm};
  background: ${T.bgHover};
  border: 1px solid ${T.borderFaint};
  color: ${T.textSecondary};
`;

const HintText = styled.span`
  font-family: ${T.fontUI};
  font-size: 11px;
  color: ${T.textMuted};
`;

const UserMessage = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const UserBubble = styled.div`
  max-width: 88%;
  background: ${T.accent};
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px 12px 3px 12px;
  font-family: ${T.fontUI};
  font-size: 12.5px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
`;

const AssistantMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
`;

const AssistantBubble = styled.div`
  background: ${T.bgElevated};
  border: 1px solid ${T.borderFaint};
  border-radius: 3px 12px 12px 12px;
  padding: 9px 12px;
  font-family: ${T.fontUI};
  font-size: 12.5px;
  line-height: 1.65;
  color: ${T.textPrimary};
  white-space: normal;
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;
  min-height: 36px;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const InsertBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: ${T.rMd};
  border: 1px solid ${T.borderSubtle};
  background: ${T.bgElevated};
  color: ${T.textSecondary};
  font-family: ${T.fontUI};
  font-size: 11.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background ${T.tFast}, border-color ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    border-color: ${T.borderStrong};
    color: ${T.textPrimary};
  }
`;

const CopyBtn = styled.button`
  width: 26px;
  height: 26px;
  border: 1px solid ${T.borderSubtle};
  background: ${T.bgElevated};
  border-radius: ${T.rMd};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${T.textMuted};
  transition: background ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    color: ${T.textPrimary};
  }
`;

const DotsWrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${T.textMuted};
  animation: dotPulse 1.2s ease-in-out infinite;

  @keyframes dotPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1); }
  }
`;

const Caret = styled.span`
  display: inline-block;
  width: 2px;
  height: 13px;
  background: ${T.accent};
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: caretBlink 0.9s step-end infinite;

  @keyframes caretBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 11px;
  border-radius: ${T.rMd};
  background: ${T.dangerFaint};
  border: 1px solid rgba(239,68,68,0.2);
  color: ${T.dangerText};
  font-family: ${T.fontUI};
  font-size: 12px;
  line-height: 1.5;
`;

const ErrorDismiss = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${T.dangerText};
  font-size: 11px;
  flex-shrink: 0;
  padding: 0 2px;
  opacity: 0.7;

  &:hover { opacity: 1; }
`;

const ContextChip = styled.div`
  font-family: ${T.fontMono};
  font-size: 10.5px;
  padding: 5px 10px;
  border-radius: ${T.rMd};
  background: ${T.warningFaint};
  border: 1px solid rgba(245,158,11,0.2);
  color: ${T.warningText};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;

  span { opacity: 0.7; }
`;

const InputArea = styled.div`
  border-top: 1px solid ${T.borderFaint};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
  background: ${T.bgSurface};
`;

const PromptTextarea = styled.textarea`
  width: 100%;
  border: 1px solid ${T.borderSubtle};
  border-radius: ${T.rMd} ${T.rMd} 0 0;
  padding: 9px 11px;
  font-family: ${T.fontUI};
  font-size: 12.5px;
  line-height: 1.55;
  resize: none;
  outline: none;
  color: ${T.textPrimary};
  background: ${T.bgInput};
  box-sizing: border-box;
  border-bottom: none;

  &::placeholder { color: ${T.textMuted}; }

  &:focus {
    border-color: ${T.borderAccent};
    box-shadow: inset 0 0 0 1px rgba(37,99,235,0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InputFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  background: ${T.bgElevated};
  border: 1px solid ${T.borderSubtle};
  border-top: none;
  border-radius: 0 0 ${T.rMd} ${T.rMd};
  padding: 5px 7px;
`;

const SendBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: ${T.rMd};
  border: none;
  background: ${T.accent};
  color: #fff;
  font-family: ${T.fontUI};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background ${T.tFast};

  &:disabled { opacity: 0.4; cursor: default; }
  &:not(:disabled):hover { background: ${T.accentHover}; }
`;

const StopBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: ${T.rMd};
  border: 1px solid ${T.borderSubtle};
  background: transparent;
  color: ${T.textSecondary};
  font-family: ${T.fontUI};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background ${T.tFast}, color ${T.tFast};

  &:hover { background: ${T.bgHover}; color: ${T.textPrimary}; }
`;

export default AiChatPanel;
