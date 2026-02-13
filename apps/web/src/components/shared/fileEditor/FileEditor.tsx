import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useParams, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Save, AlertCircle, Check } from "lucide-react";
import api from "../../../lib/axios";
import { eventBus } from "../../../events/eventBus";
import { FILES_REFRESH_EVENT } from "../../../events/fileEvents";
import { toast } from "../../../services/toast.service";

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

  const [meta, setMeta] = useState<FileMeta | null>(null);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Get metadata to confirm text-based
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

        // 2) Load raw file bytes via blob endpoint and decode as UTF-8
        const blobRes = await api.get(`/files/blob/${fileId}`, {
          responseType: "arraybuffer",
        });

        const buf = blobRes.data;
        const decoded = new TextDecoder("utf-8").decode(buf);
        setContent(decoded);
        setOriginalContent(decoded);
        setLoading(false);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to load file for editing",
        );
        setLoading(false);
      }
    };

    if (fileId) {
      load();
    }
  }, [fileId]);

  const handleSave = useCallback(async () => {
    if (!meta || !isTextMime(meta.mimeType)) return;
    try {
      setSaving(true);
      setError(null);

      const res = await api.post(`/files/edit/${fileId}`, { content });
      const json = res.data;

      if (!json?.success) {
        throw new Error(json?.error || "Failed to save file");
      }

      setOriginalContent(content);
      setJustSaved(true);
      eventBus.emit(FILES_REFRESH_EVENT);
      toast.success("Saved");
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save file");
    } finally {
      setSaving(false);
    }
  }, [fileId, meta, content]);

  const isDirty = content !== originalContent;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty && !saving && meta && isTextMime(meta.mimeType)) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, isDirty, saving, meta]);

  const goBack = () => {
    router.history.back();
  };

  if (loading) {
    return (
      <FullScreen>
        <Centered>
          <Spinner />
          <p>Loading editor…</p>
        </Centered>
      </FullScreen>
    );
  }

  return (
    <FullScreen>
      <EditorContainer>
        <TopBar>
          <LeftGroup>
            <BackButton onClick={goBack} title="Back">
              <ArrowLeft size={18} />
            </BackButton>
            <Title>
              {meta?.fileName}{" "}
              {!isTextMime(meta?.mimeType) && (
                <Muted>(not editable – non-text file)</Muted>
              )}
            </Title>
          </LeftGroup>

          <RightGroup>
            {error && (
              <ErrorChip>
                <AlertCircle size={14} />
                <span>{error}</span>
              </ErrorChip>
            )}

            <SaveButton
              disabled={saving || (!isDirty && !justSaved) || !isTextMime(meta?.mimeType)}
              onClick={handleSave}
              $saved={justSaved}
              title="Save (Ctrl+S)"
            >
              {justSaved ? <Check size={16} /> : <Save size={16} />}
              {saving ? "Saving…" : justSaved ? "Saved" : "Save"}
            </SaveButton>
          </RightGroup>
        </TopBar>

        <EditorArea>
          <TextEditor
            spellCheck={false}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isTextMime(meta?.mimeType)
                ? "Start editing…"
                : "This file type is not editable."
            }
            readOnly={!isTextMime(meta?.mimeType)}
          />
        </EditorArea>
      </EditorContainer>
    </FullScreen>
  );
};

const FullScreen = styled.div`
  position: fixed;
  inset: 0;
  background: #f3f4f6;
  display: flex;
  align-items: stretch;
  justify-content: center;
  z-index: 1200;
`;

const EditorContainer = styled.div`
  flex: 1;
  max-width: 1200px;
  margin: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: none;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.15);
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
`;

const BackButton = styled(IconButton)`
  border: 1px solid #d1d5db;
  color: #374151;
  background: #fff;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
    color: #111827;
  }
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const Muted = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
  margin-left: 6px;
`;

const ErrorChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12px;
`;

const SaveButton = styled.button<{ $saved?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  border: none;
  background: ${(p) => (p.$saved ? "#16a34a" : "#2563eb")};
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:not(:disabled):hover {
    background: ${(p) => (p.$saved ? "#15803d" : "#1d4ed8")};
  }
`;

const EditorArea = styled.div`
  flex: 1;
  padding: 12px 16px 16px;
  background: #f3f4f6;
`;

const TextEditor = styled.textarea`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  font-family: "JetBrains Mono", "Consolas", "Menlo", monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  outline: none;
  color: #111827;
  background: white;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
  }
`;

const Centered = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #374151;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
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

export default FileEditor;
