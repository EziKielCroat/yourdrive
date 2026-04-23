import React, { useState, useRef, useCallback, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  XIcon as X,
  SendIcon as Send,
  SquareIcon as Square,
  BotIcon as Bot,
  UserIcon as User,
  ChevronDownIcon as ChevronDown,
  AlertCircleIcon as AlertCircle,
  CheckCircleIcon as CheckCircle,
  Loader2Icon as Loader2,
  CornerDownLeftIcon as CornerDownLeft,
  SparklesIcon as Sparkles,
} from "../../shared/icons/index";
import { streamChat, type ChatMessage } from "../../../services/luService";
import { buildKnowledgeBaseContext } from "../data/helpCenter.data";
import api from "../../../lib/axios";

interface Message {
  id: string;
  role: "user" | "assistant" | "system-info";
  content: string;
  streaming?: boolean;
}

interface EscalationState {
  active: boolean;
  name: string;
  email: string;
  submitted: boolean;
  submitting: boolean;
  error: string | null;
}

interface AiSupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const SYSTEM_PROMPT = `You are the YourDrive support assistant. Answer questions about the YourDrive cloud storage service using the knowledge base below. Be helpful, concise, and friendly.

If you cannot find a relevant answer in the knowledge base, honestly say so and suggest the user contact human support.

## Knowledge Base
${buildKnowledgeBaseContext()}`;

const STORAGE_KEY = "yd-support-chat-history";

function loadHistory(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: Message[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-40)));
  } catch {
    /* ignore */
  }
}

export const AiSupportChat: React.FC<AiSupportChatProps> = ({
  isOpen,
  onClose,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [escalation, setEscalation] = useState<EscalationState>({
    active: false,
    name: "",
    email: "",
    submitted: false,
    submitting: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && initialQuery && messages.length === 0) {
      setPrompt(initialQuery);
      setTimeout(() => promptRef.current?.focus(), 120);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (isOpen) setTimeout(() => promptRef.current?.focus(), 150);
  }, [isOpen]);

  useEffect(() => {
    saveHistory(messages);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const send = useCallback(() => {
    const text = prompt.trim();
    if (!text || streaming) return;

    const assistantId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text },
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);
    setPrompt("");
    setStreaming(true);

    const history: ChatMessage[] = messages.map((m) => ({
      role: m.role === "system-info" ? "assistant" : m.role,
      content: m.content,
    }));
    history.push({ role: "user", content: text });

    abortRef.current = streamChat(
      [{ role: "system", content: SYSTEM_PROMPT }, ...history],
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
        onError: (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Sorry, I couldn't respond: ${err}`, streaming: false }
                : m,
            ),
          );
          setStreaming(false);
          abortRef.current = null;
        },
      },
    );
  }, [prompt, streaming, messages]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
  };

  const clearHistory = () => {
    if (streaming) stop();
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
    setEscalation({ active: false, name: "", email: "", submitted: false, submitting: false, error: null });
  };

  const startEscalation = () => {
    setEscalation((e) => ({ ...e, active: true }));
  };

  const submitEscalation = async () => {
    if (!escalation.name.trim() || !escalation.email.trim()) return;
    setEscalation((e) => ({ ...e, submitting: true, error: null }));

    const summary = messages
      .filter((m) => m.role !== "system-info")
      .map((m) => `[${m.role.toUpperCase()}]: ${m.content}`)
      .join("\n\n");

    try {
      await api.post("/support/escalate", {
        name: escalation.name.trim(),
        email: escalation.email.trim(),
        summary,
      });
      setEscalation((e) => ({ ...e, submitted: true, submitting: false }));
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "system-info",
          content: `Support ticket submitted. Our team will get back to **${escalation.email.trim()}** within 24 hours.`,
        },
      ]);
    } catch {
      setEscalation((e) => ({
        ...e,
        submitting: false,
        error: "Failed to submit ticket. Please try again.",
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const hasPreviousSession = messages.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Drawer
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <DrawerHeader>
              <HeaderLeft>
                <HeaderIcon>
                  <Sparkles size={14} />
                </HeaderIcon>
                <div>
                  <DrawerTitle>YourDrive Assistant</DrawerTitle>
                  <DrawerSubtitle>Powered by local AI</DrawerSubtitle>
                </div>
              </HeaderLeft>
              <HeaderActions>
                {hasPreviousSession && (
                  <ClearBtn onClick={clearHistory} title="Clear conversation">
                    <FlipIcon><ChevronDown size={14} /></FlipIcon>
                    Clear
                  </ClearBtn>
                )}
                <CloseBtn onClick={onClose} aria-label="Close chat">
                  <X size={16} />
                </CloseBtn>
              </HeaderActions>
            </DrawerHeader>

            <MessageArea ref={scrollRef}>
              {messages.length === 0 && (
                <WelcomeState>
                  <WelcomeOrb>
                    <Bot size={22} />
                  </WelcomeOrb>
                  <WelcomeTitle>How can I help?</WelcomeTitle>
                  <WelcomeBody>
                    Ask me anything about YourDrive — uploads, sharing, billing, security, or troubleshooting. I'll search the knowledge base and give you an instant answer.
                  </WelcomeBody>
                  <SuggestionGrid>
                    {[
                      "How do I upload large files?",
                      "How do I share a file securely?",
                      "What storage plan should I choose?",
                      "How do I set up 2FA?",
                    ].map((s) => (
                      <Suggestion key={s} onClick={() => { setPrompt(s); promptRef.current?.focus(); }}>
                        {s}
                      </Suggestion>
                    ))}
                  </SuggestionGrid>
                </WelcomeState>
              )}

              {messages.map((msg) => (
                <MessageRow key={msg.id} $role={msg.role}>
                  {msg.role === "assistant" && (
                    <AvatarWrap>
                      <Bot size={12} />
                    </AvatarWrap>
                  )}
                  {msg.role === "user" && (
                    <UserAvatarWrap>
                      <User size={12} />
                    </UserAvatarWrap>
                  )}
                  {msg.role === "system-info" ? (
                    <SystemInfoBubble>
                      <CheckCircle size={13} />
                      <span>{msg.content}</span>
                    </SystemInfoBubble>
                  ) : (
                    <Bubble $role={msg.role}>
                      {msg.content}
                      {msg.streaming && !msg.content && (
                        <ThinkingDots>
                          <Dot style={{ animationDelay: "0ms" }} />
                          <Dot style={{ animationDelay: "140ms" }} />
                          <Dot style={{ animationDelay: "280ms" }} />
                        </ThinkingDots>
                      )}
                      {msg.streaming && msg.content && <StreamCaret />}
                    </Bubble>
                  )}
                </MessageRow>
              ))}
            </MessageArea>

            {!escalation.active && messages.length >= 3 && !escalation.submitted && (
              <EscalateHint>
                <AlertCircle size={13} />
                <span>Not finding what you need?</span>
                <EscalateLink onClick={startEscalation}>Talk to a human</EscalateLink>
              </EscalateHint>
            )}

            {escalation.active && !escalation.submitted && (
              <EscalationForm>
                <EscTitle>
                  <AlertCircle size={14} />
                  Submit a support ticket
                </EscTitle>
                <EscField
                  type="text"
                  placeholder="Your name"
                  value={escalation.name}
                  onChange={(e) => setEscalation((s) => ({ ...s, name: e.target.value }))}
                />
                <EscField
                  type="email"
                  placeholder="Your email address"
                  value={escalation.email}
                  onChange={(e) => setEscalation((s) => ({ ...s, email: e.target.value }))}
                />
                {escalation.error && <EscError>{escalation.error}</EscError>}
                <EscRow>
                  <EscCancel onClick={() => setEscalation((s) => ({ ...s, active: false }))}>
                    Cancel
                  </EscCancel>
                  <EscSubmit
                    onClick={submitEscalation}
                    disabled={escalation.submitting || !escalation.name.trim() || !escalation.email.trim()}
                  >
                    {escalation.submitting ? (
                      <SpinningLoader><Loader2 size={13} /></SpinningLoader>
                    ) : (
                      <Send size={13} />
                    )}
                    {escalation.submitting ? "Sending…" : "Send ticket"}
                  </EscSubmit>
                </EscRow>
              </EscalationForm>
            )}

            <InputArea>
              <InputWrapper $disabled={streaming}>
                <PromptInput
                  ref={promptRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about YourDrive… (Enter to send)"
                  rows={2}
                  disabled={streaming}
                />
                <InputActions>
                  {streaming ? (
                    <ActionBtn $variant="stop" onClick={stop} title="Stop">
                      <Square size={12} />
                    </ActionBtn>
                  ) : (
                    <ActionBtn $variant="send" onClick={send} disabled={!prompt.trim()} title="Send (Enter)">
                      <Send size={13} />
                    </ActionBtn>
                  )}
                </InputActions>
              </InputWrapper>
              <InputHint>
                <CornerDownLeft size={10} /> Enter to send &nbsp;·&nbsp; Shift+Enter for new line
              </InputHint>
            </InputArea>
          </Drawer>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Styled components ──────────────────────────────────────────────────────

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(14, 22, 36, 0.4);
  z-index: 1290;
  backdrop-filter: blur(2px);
`;

const Drawer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(420px, 95vw);
  background: #ffffff;
  box-shadow: -4px 0 40px rgba(14, 22, 36, 0.12);
  z-index: 1300;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e5e7eb;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  flex-shrink: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const HeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  flex-shrink: 0;
`;

const DrawerTitle = styled.h3`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const DrawerSubtitle = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ClearBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: transparent;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11.5px;
  color: #64748b;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const CloseBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: background 0.12s, color 0.12s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const MessageArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
`;

const WelcomeState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 8px;
  text-align: center;
`;

const WelcomeOrb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
`;

const WelcomeTitle = styled.h4`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const WelcomeBody = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.65;
  color: #64748b;
  max-width: 280px;
  margin: 0;
`;

const SuggestionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  width: 100%;
  margin-top: 4px;
`;

const Suggestion = styled.button`
  padding: 9px 11px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11.5px;
  color: #475569;
  cursor: pointer;
  text-align: left;
  line-height: 1.4;
  transition: border-color 0.12s, background 0.12s, color 0.12s;

  &:hover {
    border-color: #bfdbfe;
    background: #eff6ff;
    color: #2563eb;
  }
`;

const MessageRow = styled.div<{ $role: string }>`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: ${(p) => (p.$role === "user" ? "flex-end" : "flex-start")};
`;

const AvatarWrap = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
  flex-shrink: 0;
  margin-top: 2px;
`;

const UserAvatarWrap = styled(AvatarWrap)`
  background: #2563eb;
  border-color: transparent;
  color: #fff;
  order: 2;
`;

const Bubble = styled.div<{ $role: string }>`
  max-width: 82%;
  padding: 10px 13px;
  border-radius: ${(p) =>
    p.$role === "user" ? "14px 14px 3px 14px" : "3px 14px 14px 14px"};
  background: ${(p) => (p.$role === "user" ? "#2563eb" : "#f8fafc")};
  border: ${(p) =>
    p.$role === "user" ? "none" : "1px solid #e9ecef"};
  color: ${(p) => (p.$role === "user" ? "#fff" : "#1e293b")};
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SystemInfoBubble = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 10px 13px;
  border-radius: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12.5px;
  line-height: 1.55;
  max-width: 90%;
`;

const ThinkingDots = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #94a3b8;
  display: inline-block;
  animation: dotBounce 1.2s ease-in-out infinite;

  @keyframes dotBounce {
    0%, 100% { opacity: 0.3; transform: scale(0.85); }
    50% { opacity: 1; transform: scale(1); }
  }
`;

const StreamCaret = styled.span`
  display: inline-block;
  width: 2px;
  height: 13px;
  background: currentColor;
  margin-left: 2px;
  vertical-align: text-bottom;
  opacity: 0.6;
  animation: caretBlink 0.85s step-end infinite;

  @keyframes caretBlink {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0; }
  }
`;

const EscalateHint = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #fefce8;
  border-top: 1px solid #fef08a;
  border-bottom: 1px solid #fef08a;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  color: #713f12;
  flex-shrink: 0;
`;

const EscalateLink = styled.button`
  background: none;
  border: none;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const EscalationForm = styled.div`
  padding: 14px 18px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
`;

const EscTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
`;

const EscField = styled.input`
  width: 100%;
  padding: 8px 11px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13px;
  color: #1e293b;
  background: #fff;
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: #94a3b8; }
  &:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
`;

const EscError = styled.p`
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 11.5px;
  color: #dc2626;
  margin: 0;
`;

const EscRow = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
`;

const EscCancel = styled.button`
  padding: 6px 13px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: transparent;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12.5px;
  color: #64748b;
  cursor: pointer;

  &:hover { background: #f1f5f9; }
`;

const EscSubmit = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #fff;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s;

  &:disabled { opacity: 0.45; cursor: default; }
  &:not(:disabled):hover { background: #1d4ed8; }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

const InputArea = styled.div`
  padding: 12px 14px 14px;
  border-top: 1px solid #f1f5f9;
  background: #fff;
  flex-shrink: 0;
`;

const InputWrapper = styled.div<{ $disabled: boolean }>`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  border: 1px solid ${(p) => (p.$disabled ? "#e2e8f0" : "#cbd5e1")};
  border-radius: 12px;
  padding: 8px 10px;
  background: ${(p) => (p.$disabled ? "#f8fafc" : "#fff")};
  transition: border-color 0.12s;

  &:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
`;

const PromptInput = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 13px;
  line-height: 1.55;
  color: #1e293b;
  background: transparent;
  resize: none;

  &::placeholder { color: #94a3b8; }
  &:disabled { cursor: not-allowed; }
`;

const InputActions = styled.div`
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
`;

const ActionBtn = styled.button<{ $variant: "send" | "stop"; disabled?: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s;
  flex-shrink: 0;
  background: ${(p) => (p.$variant === "send" ? "#2563eb" : "#f1f5f9")};
  color: ${(p) => (p.$variant === "send" ? "#fff" : "#64748b")};

  &:disabled { opacity: 0.4; cursor: default; }
  &:not(:disabled):hover { background: ${(p) => (p.$variant === "send" ? "#1d4ed8" : "#e2e8f0")}; }
`;

const FlipIcon = styled.span`
  display: flex;
  align-items: center;
  transform: rotate(180deg);
`;

const SpinningLoader = styled.span`
  display: flex;
  align-items: center;
  animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const InputHint = styled.p`
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: "Poppins", system-ui, sans-serif;
  font-size: 10.5px;
  color: #94a3b8;
  margin: 6px 2px 0;
`;

export default AiSupportChat;
