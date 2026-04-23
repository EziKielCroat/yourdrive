/**
 * Builds a bounded text snapshot of the file for the local LLM (token-safe).
 * Large files: beginning + around cursor/selection + end.
 */
const MAX_FULL_INLINE = 12_000;
const HEAD_CHARS = 3_200;
const TAIL_CHARS = 3_200;
const AROUND_SEL = 4_000;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function buildEditorDocumentForPrompt(
  full: string,
  selectionStart: number,
  selectionEnd: number,
  fileName: string,
  mimeType?: string,
): string {
  const n = full.length;
  const safeStart = clamp(selectionStart, 0, n);
  const safeEnd = clamp(selectionEnd, safeStart, n);
  const hasSel = safeEnd > safeStart;
  const cursor = safeStart;
  const meta = [
    `File: ${fileName || "untitled"}`,
    `Type: ${mimeType ?? "text"}`,
    `Length: ${n} character(s)`,
    hasSel
      ? `Selection: characters ${safeStart}–${safeEnd} (${safeEnd - safeStart} selected)`
      : `Cursor: position ${cursor}`,
  ].join("\n");

  if (n === 0) {
    return `${meta}\n\n(Empty document. Help the user start writing or paste content.)`;
  }

  if (n <= MAX_FULL_INLINE) {
    return `${meta}\n\n--- DOCUMENT (full) ---\n${full}\n--- END ---`;
  }

  const mid = Math.floor((safeStart + safeEnd) / 2);
  const half = Math.floor(AROUND_SEL / 2);
  const from = Math.max(0, mid - half);
  const to = Math.min(n, from + AROUND_SEL);
  const around = full.slice(from, to);

  return [
    meta,
    "",
    "[Large file: only a slice is sent. Beginning, region near cursor/selection, and end are included.]",
    "",
    `--- START (0–${Math.min(HEAD_CHARS, n)}) ---`,
    full.slice(0, HEAD_CHARS),
    "",
    `--- NEAR SELECTION / CURSOR (chars ${from}–${to}) ---`,
    around,
    "",
    `--- END (last ${TAIL_CHARS} chars) ---`,
    n > TAIL_CHARS ? full.slice(-TAIL_CHARS) : full,
    "---",
  ].join("\n");
}
