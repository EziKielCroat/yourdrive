import { ARTICLES } from "../components/helpcenter/data/helpCenter.data";

/**
 * Verbatim workflow bodies for the editor model (order-preserving; do not paraphrase steps).
 * Truncated to stay within token budget; full articles live in Help.
 */
const WORKFLOW_TOPIC_IDS = [
  "fm-upload",
  "fm-share",
  "fm-delete",
  "sec-2fa",
] as const;

const MAX_WORKFLOW_CHARS_PER_ARTICLE = 2_400;

function buildWorkflowExcerptsForEditor(): string {
  return WORKFLOW_TOPIC_IDS.map((id) => {
    const a = ARTICLES.find((x) => x.id === id);
    if (!a) return "";
    const body = a.content.replace(/\n{3,}/g, "\n\n").trim();
    const cap = MAX_WORKFLOW_CHARS_PER_ARTICLE;
    const tail = body.length > cap ? "\n\n[…truncated; full: Help → same title]" : "";
    return `### ${a.title} [article id: ${a.id}]\n${body.slice(0, cap)}${tail}`;
  })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Short, true facts (README / product) that may not appear in a single help excerpt.
 * Keep in sync with README when limits change.
 */
const PRODUCT_CORE = `**Product (authoritative name usage)**  
The app UI often shows the name **NexaCore**; public docs and help may say **YourDrive** — it is the same product (self-hostable cloud file storage: upload, folders, share links, device list, text editor, recycle bin, settings).

**Self-hosting**  
Deployments use a web UI + API, PostgreSQL for metadata, and S3-compatible object storage (e.g. B2). Optional Vert (document conversion) is separate.

**Storage & plans (no invented numbers in chat)**  
Help articles and README may list **example** plan tables (e.g. Free / Pro) that do **not** always match a given deployment or thesis setup. The **only** number you should treat as the user’s true limit is what they would see in the **live app: Settings / storage (or the sidebar usage bar)**. You may mention README-style **30 GB** free + **@skole.hr** **~+50 GB** *only* as “commonly described defaults”, never as a guarantee. If uncertain: tell them to open **Settings**.

**In-app editor (this screen)**  
- **Save**: Ctrl+S (Windows) / Cmd+S (Mac)  
- **Command palette**: Ctrl+K / Cmd+K  
- **AI side panel**: Ctrl+\\ / Cmd+\\  
The AI in the editor is for **your file + short product Q&A**; the Help page has a dedicated support chat for long troubleshooting.

**If a fact is not listed below**  
Do not guess numbers, plan names, or features. Say you are not sure and suggest **Help** or **Settings** in the app.`;

const FUNDAMENTAL_FAQ = `### Canned direct answers (use for basic “what is / how do I”)
Answer in **one** bold line, then **follow the numbered steps in the WORKFLOWS block below** for that topic — **same order, no invented steps**. If the topic is not in workflows, 2 short bullets only.

- **What is this app?** Cloud storage: files, **folders**, **Share** links, **Recycle Bin**, **devices**, **text editor** + AI, **Settings**.
- **Upload / share / delete / 2FA?** See the matching **###** section in **VERBATIM WORKFLOWS**; quote those steps, do not improvise a different flow.
- **Storage / plan GB?** Say: open **Settings →** storage. Do **not** state a plan table from memory; deployments differ.
- **In this editor:** **Save** Ctrl/Cmd+S, **Command palette** Ctrl/Cmd+K, **this AI** Ctrl/Cmd+\\\\ . Complex issues → in-app **Help** / support.`;

/**
 * For the file-editor LLM: compact help (title + existing excerpt) so answers stay true.
 */
function buildHelpExcerptDigest(): string {
  return ARTICLES.map((a) => {
    const oneLine = a.excerpt.replace(/\s+/g, " ").trim();
    return `• **${a.title}** — ${oneLine}`;
  }).join("\n");
}

/**
 * Merged system block: core facts + all help article excerpts.
 */
export function buildEditorPlatformKnowledgeBlock(): string {
  return `${PRODUCT_CORE}

${FUNDAMENTAL_FAQ}

## VERBATIM WORKFLOWS (source of truth for how-to; copy steps; keep order)
${buildWorkflowExcerptsForEditor()}

## Help article index (titles only; details are in Workflows or Help UI)
${buildHelpExcerptDigest()}`;
}

/** Precomputed for the file editor; same source as buildEditorPlatformKnowledgeBlock(). */
export const EDITOR_PLATFORM_KNOWLEDGE_BLOCK = buildEditorPlatformKnowledgeBlock();
