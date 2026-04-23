#!/usr/bin/env node
/**
 * YourDrive dev launcher — ngrok-style terminal dashboard
 * Starts API + Web, loads .env, validates vars, streams formatted logs.
 */
import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import net from "net";
import os from "os";
import path from "path";
import readline from "readline";

// ─── ANSI palette ────────────────────────────────────────────────────────────
const C = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  // foreground
  white:   "\x1b[97m",
  gray:    "\x1b[90m",
  cyan:    "\x1b[36m",
  green:   "\x1b[32m",
  yellow:  "\x1b[33m",
  red:     "\x1b[31m",
  blue:    "\x1b[34m",
  magenta: "\x1b[35m",
  /** Bright palette — bolji kontrast na udaljenost / slabši monitori */
  brCyan:  "\x1b[96m",
  brGreen: "\x1b[92m",
  // background badges
  bgCyan:    "\x1b[46m",
  bgBlue:    "\x1b[44m",
  bgGreen:   "\x1b[42m",
  bgRed:     "\x1b[41m",
  bgYellow:  "\x1b[43m",
  bgGray:    "\x1b[100m",
};

const cc = (...parts) => parts.join("") + C.reset;

// ─── Box drawing helpers ──────────────────────────────────────────────────────
const BOX_W = 68; // visible characters between │ borders (incl. padding spaces)

const dashSpaced = process.env.YOURDRIVE_DEV_DASH_SPACED !== "0";

/** Strip ANSI escape sequences to get the visible (printable) length. */
function visLen(str) {
  const plain = str.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
  let n = 0;
  for (const ch of plain) {
    const cp = ch.codePointAt(0);
    // Emoji / fullwidth block — treat as 2 columns
    n += (cp >= 0x1F000 && cp <= 0x1FFFF) ? 2 : 1;
  }
  return n;
}

/**
 * Render one row of the box.
 * @param {string} content  - The pre-colored string to display
 * @param {number} padLeft  - Leading spaces (default 1)
 */
function boxLine(content = "", padLeft = 1) {
  const fill = BOX_W - padLeft - visLen(content) - 1; // -1 for trailing space
  return `│${" ".repeat(padLeft)}${content}${" ".repeat(Math.max(0, fill))} │`;
}

function boxDivider(left = "├", right = "┤", mid = "─") {
  return `${left}${mid.repeat(BOX_W)}${right}`;
}

function boxTop()    { return `╭${"─".repeat(BOX_W)}╮`; }
function boxBottom() { return `╰${"─".repeat(BOX_W)}╯`; }

// ─── Env file parser ──────────────────────────────────────────────────────────
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const vars = {};
  for (const raw of fs.readFileSync(filePath, "utf-8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val    = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) val = val.slice(1, -1);
    vars[key] = val;
  }
  return vars;
}

// ─── Port helpers ─────────────────────────────────────────────────────────────
function canBindPort(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.unref();
    s.on("error", () => resolve(false));
    s.listen(port, "0.0.0.0", () => s.close(() => resolve(true)));
  });
}

async function freePort(preferred, label, max = 25) {
  for (let i = 0; i <= max; i++) {
    if (await canBindPort(preferred + i)) return preferred + i;
  }
  throw new Error(`No open port near ${preferred} for ${label}`);
}

// ─── LAN addresses ────────────────────────────────────────────────────────────
function lanHosts() {
  return [
    ...new Set(
      Object.values(os.networkInterfaces())
        .flat()
        .filter((i) => i && i.family === "IPv4" && !i.internal)
        .map((i) => i.address),
    ),
  ];
}

// ─── Health check ─────────────────────────────────────────────────────────────
function httpGet(url, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => resolve({ status: res.statusCode, body }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

/**
 * OpenAI-compatible GET /v1/models (Ollama, Groq, OpenAPI proxies, etc.)
 */
async function checkAiBackend(baseUrl, apiKey, model) {
  const base = (baseUrl || "").trim().replace(/\/$/, "");
  if (!base) {
    return { kind: "unset" };
  }
  const m = (model || "").trim() || "phi3:mini";
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 3000);
  try {
    const headers = { Accept: "application/json" };
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await fetch(`${base}/v1/models`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) {
      return { kind: "error", base, message: `HTTP ${res.status}` };
    }
    const j = await res.json();
    const raw = j.data || j.models || [];
    const ids = raw
      .map((x) => (x && (x.id || x.name)) || (typeof x === "string" ? x : null))
      .filter(Boolean);
    if (ids.length > 0 && m) {
      const found = ids.some(
        (id) => id === m || id.endsWith(`:${m}`) || id.split(":").includes(m),
      );
      if (!found) {
        return {
          kind: "ok",
          base,
          model: m,
          modelWarning: `AI: model "${m}" not in /v1/models — e.g. ollama pull ${m}`,
        };
      }
    }
    return { kind: "ok", base, model: m };
  } catch (e) {
    clearTimeout(t);
    let msg = e?.name === "AbortError" ? "timeout (3s)" : e?.message || String(e);
    const c = e?.cause;
    if (c && typeof c === "object" && c.code) {
      msg = `${msg} [${c.code}]`;
    } else if (c && typeof c === "object" && c.message) {
      msg = `${msg} (${c.message})`;
    }
    return { kind: "error", base, message: msg };
  }
}

// ─── Timestamp ────────────────────────────────────────────────────────────────
function ts() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

// ─── Service label badge ──────────────────────────────────────────────────────
function badge(name) {
  if (name === "API") return cc(C.bgBlue,  C.white, C.bold, " API ", C.reset, " ");
  if (name === "WEB") return cc(C.bgCyan,  C.white, C.bold, " WEB ", C.reset, " ");
  return cc(C.bgGray, C.white, C.bold, ` ${name} `, C.reset, " ");
}

// ─── Line classifier & formatter ─────────────────────────────────────────────
const NOISE = [
  /^\s*$/,
  /^>\s+/,                              // > api@1.0.0 dev / > tsx watch ...
  /^◇\s+injected env/,                 // tsx --env-file banner
  /^\s*at\s+\S+.*\(.*:\d+:\d+\)\s*$/, // stack trace frames
  /^\s*at\s+(Object|Module|internal|after|new\s)\S*/,
  /^\s*\^$/,                            // lone caret from Node parse errors
  /Debugger (listening|attached)/,
  /For help, see: https/,
  /press h \+ enter/i,
  /➜\s+(Local|Network):/i,
  /VITE\s+v[\d.]+\s+ready in/i,        // handled via classifyLine
];

const HTTP_METHODS = /^\s*(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(\S+)\s+(\d{3})\s+(\S+)/;

function classifyLine(line) {
  const l = line.trim();
  if (!l) return null;
  if (NOISE.some((r) => r.test(l))) return null;

  // HTTP request log (from morgan/express logger)
  const httpMatch = HTTP_METHODS.exec(l);
  if (httpMatch) {
    const [, method, url, status, time] = httpMatch;
    const code = parseInt(status, 10);
    const statusColor = code >= 500 ? C.red : code >= 400 ? C.yellow : C.green;
    const methodColor = method === "GET" ? C.cyan : method === "POST" ? C.green : C.magenta;
    return {
      type: "request",
      text: [
        cc(C.dim, "← "),
        cc(C.bold, methodColor, method.padEnd(7)),
        cc(C.white, url.padEnd(35)),
        cc(C.bold, statusColor, status),
        cc(C.dim, `  ${time}`),
      ].join(""),
    };
  }

  // Vite: proxy error
  if (/http proxy error/i.test(l)) {
    const urlMatch = l.match(/proxy error[:\s]+(\S+)/i);
    const target = urlMatch ? urlMatch[1] : "";
    return { type: "warn", text: cc(C.yellow, `⚑  proxy error`) + (target ? cc(C.dim, `  ${target}`) : "") };
  }

  // Vite: VITE ready line
  if (/VITE\s+v[\d.]+\s+ready/i.test(l)) {
    const msMatch = l.match(/ready in ([\d.]+)/i);
    const ms = msMatch ? msMatch[1] + "ms" : "";
    return { type: "ok", text: cc(C.green, C.bold, "✓  Vite ready") + (ms ? cc(C.dim, `  (${ms})`) : "") };
  }

  // Vite: Local / Network URL lines — skip (already in header)
  if (/➜\s+(Local|Network):/i.test(l)) return null;
  if (/press h \+ enter/i.test(l)) return null;

  // Express / API: server running
  if (/✅\s*API server running/i.test(l)) {
    const portMatch = l.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : "";
    return { type: "ok", text: cc(C.green, C.bold, "✓  API listening") + (port ? cc(C.dim, `  :${port}`) : "") };
  }

  // Prisma: connected
  if (/✅\s*Prisma connected/i.test(l)) {
    return { type: "ok", text: cc(C.green, C.bold, "✓  Prisma connected") };
  }

  // Prisma: error
  if (/❌\s*Prisma/i.test(l) || /PrismaClientConstructorValidationError/i.test(l)) {
    return { type: "error", text: cc(C.red, C.bold, "✗  Prisma error  ") + cc(C.red, l.replace(/^[❌\s]+/, "").slice(0, 60)) };
  }

  // DATABASE_URL missing message
  if (/DATABASE_URL is not set/i.test(l)) {
    return { type: "error", text: cc(C.red, C.bold, "✗  DATABASE_URL missing — set it in apps/api/.env") };
  }

  // Generic error
  if (/error|exception|ECONNREFUSED|ENOENT/i.test(l)) {
    const short = l.slice(0, 80);
    return { type: "error", text: cc(C.red, `✗  ${short}`) };
  }

  // Generic warning
  if (/warn/i.test(l)) {
    return { type: "warn", text: cc(C.yellow, `⚠  ${l.slice(0, 80)}`) };
  }

  // HMR update
  if (/hmr update/i.test(l)) {
    const fileMatch = l.match(/hmr update\s+(.*)/i);
    const file = fileMatch ? fileMatch[1].trim() : "";
    return { type: "info", text: cc(C.cyan, "↺  HMR ") + cc(C.dim, file) };
  }

  // Default: dim passthrough
  return { type: "plain", text: cc(C.dim, l.slice(0, 90)) };
}

function printLog(svcName, line) {
  const result = classifyLine(line);
  if (!result) return;
  const time  = cc(C.dim, ts());
  const bdg   = badge(svcName);
  process.stdout.write(`  ${time}  ${bdg}${result.text}\n`);
}

// ─── Platform-aware key symbol ────────────────────────────────────────────────
const isMac = process.platform === "darwin";
const ctrlKey = isMac ? "⌃C" : "Ctrl+C";

// ─── Header dashboard ─────────────────────────────────────────────────────────
function printDashboard({ webPort, apiPort, warnings, aiCheck }) {
  const hosts    = lanHosts();
  const localWeb = `http://localhost:${webPort}`;
  const localApi = `http://localhost:${apiPort}`;

  const rows = [];
  rows.push(boxTop());

  // ── Services ──
  rows.push(boxLine(cc(C.dim, C.bold, "SERVICES")));
  rows.push(boxLine(`  ${cc(C.blue,  C.bold, "●")}  ${cc(C.bold, "api")}    ${cc(C.brCyan, C.bold, localApi)}`));
  rows.push(boxLine(`  ${cc(C.brGreen, C.bold, "●")}  ${cc(C.bold, "web")}    ${cc(C.brCyan, C.bold, localWeb)}`));
  if (hosts.length > 0) {
    rows.push(boxLine(`  ${cc(C.dim, "◌")}  ${cc(C.bold, C.dim, "lan")}    ${cc(C.white, `http://${hosts[0]}:${webPort}`)}`));
  }
  if (dashSpaced) rows.push(boxLine(""));

  rows.push(boxDivider());

  // ── Links ──
  rows.push(boxLine(cc(C.dim, C.bold, "LINKS")));
  rows.push(boxLine(`  ${cc(C.dim, "→")}  health        ${cc(C.brCyan, C.bold, `${localApi}/api/health`)}`));
  rows.push(boxLine(`  ${cc(C.dim, "→")}  share test    ${cc(C.brCyan, C.bold, `${localWeb}/s/<id>`)}`));
  if (hosts.length > 0) {
    rows.push(boxLine(`  ${cc(C.dim, "→")}  lan (web)     ${cc(C.brCyan, C.bold, `http://${hosts[0]}:${webPort}`)}`));
    rows.push(boxLine(`  ${cc(C.dim, "→")}  lan (api)     ${cc(C.brCyan, C.bold, `http://${hosts[0]}:${apiPort}`)}`));
  }
  if (dashSpaced) rows.push(boxLine(""));

  // ── Local AI (VITE_LU_* in apps/web/.env.local) ──
  if (aiCheck?.kind === "unset") {
    rows.push(
      boxLine(
        `  ${cc(C.dim, "◌")}  ${cc(C.dim, "ai")}          ${cc(
          C.dim,
          "optional — set VITE_LU_API_URL in apps/web",
        )}`,
      ),
    );
  } else if (aiCheck?.kind === "ok") {
    const u = aiCheck.base;
    const short = u.length > 42 ? `${u.slice(0, 38)}…` : u;
    const tag = aiCheck.model ? ` · ${aiCheck.model}` : "";
    rows.push(
      boxLine(
        `  ${cc(C.brGreen, "✓")}  ${cc(C.bold, "ai")}          ${cc(C.brCyan, C.bold, short)}${cc(C.dim, tag)}`,
      ),
    );
  } else if (aiCheck?.kind === "error") {
    rows.push(
      boxLine(
        `  ${cc(C.red, C.bold, "✗")}  ${cc(C.bold, "ai")}          ${cc(C.red, C.bold, "unreachable (see NOTES)")}`,
      ),
    );
  }
  if (dashSpaced) rows.push(boxLine(""));

  // ── Warnings ──
  if (warnings.length > 0) {
    rows.push(boxDivider());
    rows.push(boxLine(cc(C.dim, C.bold, "NOTES")));
    for (const w of warnings) {
      rows.push(boxLine(`  ${cc(C.yellow, C.bold, "⚠ ")}  ${cc(C.yellow, C.bold, w)}`));
    }
  }

  rows.push(boxDivider());

  // ── Controls ──
  rows.push(boxLine(cc(C.dim, C.bold, "CONTROLS")));
  rows.push(boxLine(
    `  ${cc(C.dim, ctrlKey)} → shutdown   ·   ${cc(C.dim, `${ctrlKey} ×2`)} → force kill`,
  ));
  rows.push(boxLine(
    `  ${cc(C.dim, "dev:api")}  ·  ${cc(C.dim, "dev:web")}  ·  ${cc(C.dim, "db:push")}  ·  ${cc(C.dim, "db:studio")}`,
  ));

  rows.push(boxBottom());

  console.clear();
  for (const r of rows) console.log(r);
  console.log();
  console.log(
    cc(
      C.dim,
      C.bold,
      "  For larger text, increase the terminal / editor font (e.g. Cursor: Settings → Font Size).  ",
    ),
  );
  console.log();
  if (dashSpaced) console.log();

  const label = "  LIVE OUTPUT ";
  const pad   = Math.max(0, BOX_W - label.length);
  console.log(cc(C.dim, C.bold, `  ──${label}${"─".repeat(pad)}──`));
  console.log();
  console.log();
}

// ─── State ────────────────────────────────────────────────────────────────────
const root        = path.resolve();
const isWin       = process.platform === "win32";
const services    = [];
let shuttingDown  = false;
let sigintCount   = 0;
let resolvedApi   = 3000;
let resolvedWeb   = 5173;

// ─── Detect monorepo structure ────────────────────────────────────────────────
function detectStructure() {
  for (const s of [
    { api: "apps/api", web: "apps/web" },
    { api: "api",      web: "web"      },
    { api: "api",      web: "client"   },
  ]) {
    if (
      fs.existsSync(path.join(root, s.api)) &&
      fs.existsSync(path.join(root, s.web))
    ) return s;
  }
  return null;
}

// ─── Service spawner ──────────────────────────────────────────────────────────
function startService(name, cwd, args, envOverrides = {}) {
  const child = spawn(isWin ? "npm.cmd" : "npm", args, {
    cwd,
    env:   { ...process.env, ...envOverrides },
    stdio: ["inherit", "pipe", "pipe"],
    shell: isWin,
    windowsHide: true,
  });

  const pump = (stream) => {
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    rl.on("line", (line) => printLog(name, line));
  };
  pump(child.stdout);
  pump(child.stderr);

  child.on("error", (err) => {
    process.stdout.write(`  ${ts()}  ${badge(name)}${cc(C.red, `✗  spawn error: ${err.message}`)}\n`);
    if (!shuttingDown) void shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const msg = code === 0
      ? cc(C.yellow, "◌  exited cleanly")
      : cc(C.red, `✗  exited (code=${code ?? "?"}, signal=${signal ?? "none"})`);
    process.stdout.write(`  ${ts()}  ${badge(name)}${msg}\n`);
    void shutdown(code && code !== 0 ? 1 : 0);
  });

  services.push({ name, child });
  return child;
}

// ─── Shutdown ─────────────────────────────────────────────────────────────────
async function killService({ name, child }) {
  if (!child || child.killed || child.exitCode !== null) return;
  process.stdout.write(`  ${ts()}  ${badge(name)}${cc(C.yellow, "◌  stopping…")}\n`);
  if (isWin) {
    await new Promise((res) => {
      const k = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        stdio: "ignore", windowsHide: true,
      });
      k.on("close", res);
      k.on("error", res);
    });
    return;
  }
  try { child.kill("SIGTERM"); } catch {}
  await new Promise((res) => {
    const t = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} res(); }, 2500);
    child.once("exit", () => { clearTimeout(t); res(); });
  });
}

async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log();
  console.log(cc(C.dim, "  ─── shutting down ──────────────────────────────────────────────────"));
  await Promise.all(services.map(killService));
  console.log(`  ${cc(C.green, "✓  clean exit")}\n`);
  process.exit(code);
}

// ─── Health check loop ────────────────────────────────────────────────────────
let lastHealthState = null;

async function runHealthCheck(apiPort) {
  const url = `http://localhost:${apiPort}/api/health`;
  try {
    const t0  = Date.now();
    const res = await httpGet(url, 3000);
    const ms  = Date.now() - t0;
    if (res.status === 200 && lastHealthState !== "ok") {
      lastHealthState = "ok";
      process.stdout.write(
        `  ${cc(C.dim, ts())}  ${badge("API")}${cc(C.green, C.bold, "✓  health OK")}${cc(C.dim, `  ${ms}ms`)}\n`,
      );
    }
  } catch {
    if (lastHealthState === "ok") {
      lastHealthState = "down";
      process.stdout.write(
        `  ${cc(C.dim, ts())}  ${badge("API")}${cc(C.yellow, "⚑  health unreachable")}\n`,
      );
    }
  }
}

// ─── Signal handlers ──────────────────────────────────────────────────────────
function attachSignals() {
  process.on("SIGINT", () => {
    sigintCount++;
    if (sigintCount > 1) { console.log(cc(C.red, "\n  ✗  force kill")); process.exit(1); }
    void shutdown(0);
  });
  process.on("SIGTERM", () => void shutdown(0));
  process.on("SIGHUP",  () => void shutdown(0));
  process.on("unhandledRejection", (r) => {
    process.stdout.write(`  ${cc(C.red, `✗  unhandled: ${String(r).slice(0, 80)}`)}\n`);
  });
  process.on("uncaughtException", (e) => {
    process.stdout.write(`  ${cc(C.red, `✗  uncaught: ${e.message}`)}\n`);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const structure = detectStructure();
  if (!structure) {
    console.error("✗  Cannot detect api/web project structure.");
    process.exit(1);
  }

  attachSignals();

  // Load env files
  const apiEnvPath  = path.join(root, structure.api, ".env");
  const rootEnvPath = path.join(root, ".env");
  const apiEnv      = { ...parseEnvFile(rootEnvPath), ...parseEnvFile(apiEnvPath) };

  // Collect warnings
  const warnings = [];
  if (!fs.existsSync(apiEnvPath) && !fs.existsSync(rootEnvPath)) {
    warnings.push("No .env file found — copy apps/api/.env.example → apps/api/.env");
  }
  if (!apiEnv.DATABASE_URL) {
    warnings.push("DATABASE_URL missing — API will exit on start");
  }
  if (!apiEnv.JWT_SECRET) {
    warnings.push("JWT_SECRET missing — auth endpoints will fail");
  }

  // Web .env: optional local LLM (same vars Vite uses)
  const webRoot = path.join(root, structure.web);
  const webEnv = {
    ...parseEnvFile(path.join(webRoot, ".env")),
    ...parseEnvFile(path.join(webRoot, ".env.local")),
  };
  const viteLuUrl = (webEnv.VITE_LU_API_URL || "").trim();
  const viteLuKey = (webEnv.VITE_LU_API_KEY || "").trim();
  const viteLuModel = (webEnv.VITE_LU_MODEL || "").trim() || "phi3:mini";
  const aiCheck = await checkAiBackend(viteLuUrl, viteLuKey, viteLuModel);
  if (aiCheck.kind === "error" && viteLuUrl) {
    warnings.push(
      `AI: ${aiCheck.message} at ${aiCheck.base} — nothing on :11434? Start Ollama.app or \`ollama serve\` first, then re-run \`npm run dev\` (CORS/OLLAMA_ORIGINS is for the browser only)`,
    );
  }
  if (aiCheck.kind === "ok" && aiCheck.modelWarning) {
    warnings.push(aiCheck.modelWarning);
  }

  // Resolve ports
  const prefApi = parseInt(process.env.API_PORT ?? apiEnv.PORT ?? "3000", 10);
  const prefWeb = parseInt(process.env.WEB_PORT ?? "5173", 10);
  resolvedApi   = await freePort(prefApi, "API");
  resolvedWeb   = await freePort(prefWeb, "Web");
  if (resolvedWeb === resolvedApi) resolvedWeb = await freePort(resolvedWeb + 1, "Web");

  // Print dashboard
  printDashboard({
    webPort: resolvedWeb,
    apiPort: resolvedApi,
    warnings,
    aiCheck,
  });

  // Start services
  startService("API", path.join(root, structure.api), ["run", "dev"], {
    ...apiEnv,
    PORT: String(resolvedApi),
  });

  setTimeout(() =>
    startService("WEB", path.join(root, structure.web), ["run", "dev"], {
      PORT:             String(resolvedWeb),
      WEB_PORT:         String(resolvedWeb),
      API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? `http://localhost:${resolvedApi}`,
    }),
    800,
  );

  // Health check: first attempt after 6s, then every 15s
  setTimeout(() => {
    void runHealthCheck(resolvedApi);
    setInterval(() => void runHealthCheck(resolvedApi), 15_000);
  }, 6_000);
}

void main();
