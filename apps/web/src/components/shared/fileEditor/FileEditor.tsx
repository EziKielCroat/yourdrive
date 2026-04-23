import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import styled, { createGlobalStyle } from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useRouter } from "@tanstack/react-router";
import {
  ArrowLeftIcon as ArrowLeft,
  SaveIcon as Save,
  AlertCircleIcon as AlertCircle,
  CheckIcon as Check,
  SparklesIcon as Sparkles,
  TerminalIcon as Terminal,
  CopyIcon as Copy,
  RotateCcwIcon as RotateCcw,
} from "../icons/index";
import api from "../../../lib/axios";
import { eventBus } from "../../../events/eventBus";
import { FILES_REFRESH_EVENT } from "../../../events/fileEvents";
import { toast } from "../../../services/toast.service";
import { AiChatPanel } from "./AiChatPanel";
import { StatusBar } from "./StatusBar";
import { CommandPalette, useEditorCommands } from "./CommandPalette";
import { T, getEditorVars } from "./editor.tokens";
import { useUserUiPreferencesStore } from "../../../store/userUiPreferencesStore";

type FileMeta = {
  fileName: string;
  mimeType?: string;
};

const isTextMime = (mime?: string | null) => {
  if (!mime) return false;
  const m = mime.toLowerCase();
  return (
    m.startsWith("text/") ||
    m === "application/json" ||
    m === "application/xml" ||
    m === "application/javascript"
  );
};

export const FileEditor: React.FC = () => {
  const { fileId } = useParams({ strict: false }) as { fileId: string };
  const router = useRouter();
  const resolvedTheme = useUserUiPreferencesStore((s) => s.resolvedTheme);

  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [selectedText, setSelectedText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const metaRes = await api.get(`/files/content/${fileId}`);
        const metaJson = metaRes.data;
        const mimeType = metaJson.mimeType as string | undefined;
        const fileName = (metaJson.fileName as string) || "Untitled";

        if (!isTextMime(mimeType)) {
          setMeta({ fileName, mimeType });
          setError("Only text-based files can be edited.");
          setLoading(false);
          return;
        }

        setMeta({ fileName, mimeType });

        const blobRes = await api.get(`/files/blob/${fileId}`, {
          responseType: "arraybuffer",
        });
        const decoded = new TextDecoder("utf-8").decode(blobRes.data);
        setContent(decoded);
        setOriginalContent(decoded);
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load file");
        setLoading(false);
      }
    };

    if (fileId) load();
  }, [fileId]);

  const handleSave = useCallback(async () => {
    if (!meta || !isTextMime(meta.mimeType)) return;
    try {
      setSaving(true);
      setError(null);
      const res = await api.post(`/files/edit/${fileId}`, { content });
      const json = res.data;
      if (!json?.success) throw new Error(json?.error || "Failed to save");
      setOriginalContent(content);
      setJustSaved(true);
      eventBus.emit(FILES_REFRESH_EVENT);
      toast.success("Saved");
      setTimeout(() => setJustSaved(false), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save file");
    } finally {
      setSaving(false);
    }
  }, [fileId, meta, content]);

  const isDirty = content !== originalContent;

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = textareaRef.current;
      if (!el) {
        setContent((prev) => prev + "\n" + text);
        return;
      }
      const start = el.selectionStart ?? content.length;
      const end = el.selectionEnd ?? content.length;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const sep = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
      const newContent = before + sep + text + after;
      setContent(newContent);
      const newCursor = start + sep.length + text.length;
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(newCursor, newCursor);
      }, 0);
    },
    [content],
  );

  const handleSelectionChange = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart ?? 0;
    const e = el.selectionEnd ?? 0;
    setSelectionStart(s);
    setSelectionEnd(e);
    setSelectedText(el.value.slice(s, e));
  }, []);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving && meta && isTextMime(meta.mimeType)) handleSave();
        return;
      }
      if (mod && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }
      if (mod && e.key === "\\") {
        e.preventDefault();
        setAiOpen((v) => !v);
        return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, isDirty, saving, meta]);

  // ── Command palette actions ──────────────────────────────────
  const commands = useEditorCommands({
    onSave: handleSave,
    onToggleAi: () => setAiOpen((v) => !v),
    onCopyAll: () => navigator.clipboard.writeText(content),
    onSelectAll: () => {
      const el = textareaRef.current;
      if (el) { el.focus(); el.select(); }
    },
    onWordCount: () => {
      const w = content.trim().split(/\s+/).filter(Boolean).length;
      toast.success(`${w.toLocaleString()} words`);
    },
    content,
  });

  // Override the clear action with a real implementation
  const commandsWithClear = useMemo(
    () =>
      commands.map((c) =>
        c.id === "clear"
          ? {
              ...c,
              action: () => {
                if (window.confirm("Clear all content? This cannot be undone.")) {
                  setContent("");
                }
              },
            }
          : c,
      ),
    [commands],
  );

  const goBack = () => router.history.back();

  if (loading) {
    return (
      <Shell style={getEditorVars(resolvedTheme)}>
        <LoadingFrame>
          <Loader />
          <LoadingText>Loading file…</LoadingText>
        </LoadingFrame>
      </Shell>
    );
  }

  const editable = isTextMime(meta?.mimeType);

  return (
    <>
      <EditorGlobalStyles />
      <Shell style={getEditorVars(resolvedTheme)}>
        <EditorFrame>
          {/* ── Top bar ──────────────────────────────────────── */}
          <TopBar>
            <TopLeft>
              <BackBtn onClick={goBack} title="Go back">
                <ArrowLeft size={15} strokeWidth={2.2} />
              </BackBtn>
              <FileInfo>
                <FileName>{meta?.fileName ?? "Untitled"}</FileName>
                {!editable && <ModeBadge>read-only</ModeBadge>}
                {isDirty && (
                  <DirtyDot title="Unsaved changes" aria-label="Unsaved changes" />
                )}
              </FileInfo>
            </TopLeft>

            <TopRight>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ErrorChip>
                      <AlertCircle size={12} />
                      <span>{error}</span>
                    </ErrorChip>
                  </motion.div>
                )}
              </AnimatePresence>

              <TopBtn
                onClick={() => setCmdOpen(true)}
                title="Command palette (Ctrl+K)"
              >
                <Terminal size={13} />
                <BtnLabel>Commands</BtnLabel>
                <ShortcutHint>K</ShortcutHint>
              </TopBtn>

              {editable && (
                <TopBtn
                  onClick={() => setContent(originalContent)}
                  disabled={!isDirty}
                  title="Revert to saved"
                >
                  <RotateCcw size={13} />
                </TopBtn>
              )}

              <TopBtn
                onClick={() => navigator.clipboard.writeText(content)}
                title="Copy all"
              >
                <Copy size={13} />
              </TopBtn>

              <SaveBtn
                disabled={saving || (!isDirty && !justSaved) || !editable}
                onClick={handleSave}
                $saved={justSaved}
                title="Save (Ctrl+S)"
              >
                {justSaved ? <Check size={13} /> : <Save size={13} />}
                <BtnLabel>{saving ? "Saving…" : justSaved ? "Saved" : "Save"}</BtnLabel>
              </SaveBtn>

              <AiBtn
                onClick={() => setAiOpen((v) => !v)}
                $active={aiOpen}
                title="AI assistant (Ctrl+\\)"
              >
                <Sparkles size={13} />
                <BtnLabel>AI</BtnLabel>
                {selectedText.trim() && !aiOpen && <SelectionDot title="Selection ready" />}
              </AiBtn>
            </TopRight>
          </TopBar>

          {/* ── Content area ─────────────────────────────────── */}
          <ContentRow>
            <EditorPane>
              <CodeTextarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                onClick={handleSelectionChange}
                spellCheck={false}
                placeholder={
                  editable
                    ? "Start editing… (Ctrl+K for commands, Ctrl+\\ for AI)"
                    : "This file type cannot be edited."
                }
                readOnly={!editable}
                aria-label="File content editor"
                aria-multiline="true"
              />
            </EditorPane>

            <AnimatePresence>
              {aiOpen && (
                <AiChatPanel
                  textareaRef={textareaRef}
                  onInsert={insertAtCursor}
                  fileName={meta?.fileName ?? "Untitled"}
                  mimeType={meta?.mimeType}
                  documentContent={content}
                  selectionStart={selectionStart}
                  selectionEnd={selectionEnd}
                  selectedText={selectedText}
                />
              )}
            </AnimatePresence>
          </ContentRow>

          {/* ── Status bar ───────────────────────────────────── */}
          <StatusBar
            content={content}
            selectionStart={selectionStart}
            mimeType={meta?.mimeType}
            isDirty={isDirty}
          />
        </EditorFrame>

        {/* ── Command palette ──────────────────────────────── */}
        <CommandPalette
          isOpen={cmdOpen}
          onClose={() => setCmdOpen(false)}
          commands={commandsWithClear}
        />
      </Shell>
    </>
  );
};

// ── Global style (scoped to editor mount) ─────────────────────────────────
const EditorGlobalStyles = createGlobalStyle`
  body:has([data-editor-root]) {
    overflow: hidden;
  }
`;

// ── Styled components ──────────────────────────────────────────────────────

const Shell = styled.div`
  position: fixed;
  inset: 0;
  background: ${T.bgShell};
  display: flex;
  align-items: stretch;
  justify-content: center;
  z-index: ${T.zEditor};
  padding: 20px;

  @media (max-width: 600px) {
    padding: 0;
  }
`;

const EditorFrame = styled.div`
  flex: 1;
  max-width: 1480px;
  width: 100%;
  background: ${T.bgSurface};
  border-radius: ${T.rXl};
  border: 1px solid ${T.borderFaint};
  box-shadow: ${T.shadowCard};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 600px) {
    border-radius: 0;
    border: none;
  }
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: 48px;
  background: ${T.bgElevated};
  border-bottom: 1px solid ${T.borderFaint};
  flex-shrink: 0;
  gap: 10px;
`;

const TopLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const BackBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: ${T.rMd};
  border: 1px solid ${T.borderSubtle};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${T.textSecondary};
  flex-shrink: 0;
  transition: background ${T.tFast}, color ${T.tFast}, border-color ${T.tFast};

  &:hover {
    background: ${T.bgHover};
    border-color: ${T.borderStrong};
    color: ${T.textPrimary};
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
`;

const FileName = styled.span`
  font-family: ${T.fontUI};
  font-size: 13.5px;
  font-weight: 600;
  color: ${T.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
`;

const ModeBadge = styled.span`
  font-family: ${T.fontUI};
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: ${T.rFull};
  background: ${T.bgHover};
  border: 1px solid ${T.borderFaint};
  color: ${T.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
`;

const DirtyDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${T.warningText};
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const TopRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const TopBtn = styled.button<{ disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: ${T.rMd};
  border: 1px solid transparent;
  background: transparent;
  color: ${T.textSecondary};
  font-family: ${T.fontUI};
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: background ${T.tFast}, color ${T.tFast}, border-color ${T.tFast};

  &:hover:not(:disabled) {
    background: ${T.bgHover};
    border-color: ${T.borderFaint};
    color: ${T.textPrimary};
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const BtnLabel = styled.span`
  @media (max-width: 720px) {
    display: none;
  }
`;

const ShortcutHint = styled.kbd`
  font-family: ${T.fontMono};
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  background: ${T.bgBase};
  border: 1px solid ${T.borderFaint};
  color: ${T.textMuted};

  @media (max-width: 720px) {
    display: none;
  }
`;

const SelectionDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${T.accentHover};
  position: absolute;
  top: 4px;
  right: 4px;
`;

const SaveBtn = styled.button<{ $saved?: boolean; disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 13px;
  border-radius: ${T.rMd};
  border: none;
  background: ${(p) => (p.$saved ? T.success : T.accent)};
  color: #fff;
  font-family: ${T.fontUI};
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background ${T.tFast}, opacity ${T.tFast};

  &:disabled { opacity: 0.35; cursor: default; }
  &:not(:disabled):hover { background: ${(p) => (p.$saved ? "#16a34a" : T.accentHover)}; }
`;

const AiBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: ${T.rMd};
  border: 1px solid ${(p) => (p.$active ? "rgba(37,99,235,0.4)" : T.borderSubtle)};
  background: ${(p) => (p.$active ? T.accentFaint : "transparent")};
  color: ${(p) => (p.$active ? T.accentHover : T.textSecondary)};
  font-family: ${T.fontUI};
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: background ${T.tFast}, border-color ${T.tFast}, color ${T.tFast};

  &:hover {
    background: ${T.accentFaint};
    border-color: rgba(37,99,235,0.4);
    color: ${T.accentHover};
  }
`;

const ErrorChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: ${T.rFull};
  background: ${T.dangerFaint};
  border: 1px solid rgba(239,68,68,0.22);
  color: ${T.dangerText};
  font-family: ${T.fontUI};
  font-size: 11.5px;
  white-space: nowrap;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContentRow = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
`;

const EditorPane = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: ${T.bgBase};
  overflow: hidden;
`;

const CodeTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 18px 22px;
  font-family: ${T.fontMono};
  font-size: 13.5px;
  line-height: 1.7;
  resize: none;
  color: ${T.textCode};
  background: transparent;
  caret-color: ${T.accentHover};
  tab-size: 2;
  box-sizing: border-box;

  &::placeholder {
    color: ${T.textMuted};
    font-style: italic;
  }

  &::-webkit-scrollbar { width: 6px; height: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${T.borderSubtle};
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover { background: ${T.borderStrong}; }

  /* Selection highlight */
  &::selection {
    background: rgba(37,99,235,0.28);
    color: inherit;
  }
`;

const LoadingFrame = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
`;

const Loader = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2.5px solid ${T.borderSubtle};
  border-top-color: ${T.accent};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-family: ${T.fontUI};
  font-size: 13px;
  color: ${T.textMuted};
`;

export default FileEditor;
