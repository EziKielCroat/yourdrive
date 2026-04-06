import type { Request } from "express";

/** Quick tunnel / dev proxy hosts — never use these for persisted share links when FRONTEND_URL is unset. */
export function isEphemeralTunnelHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h.endsWith(".trycloudflare.com") ||
    h.endsWith(".cfargotunnel.com") ||
    h.endsWith(".ngrok.io") ||
    h.endsWith(".ngrok-free.app") ||
    h.endsWith(".loca.lt")
  );
}

function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

export function normalizeFrontendBase(rawBase: string): string {
  try {
    const url = new URL(rawBase);
    if (url.protocol === "https:" && isLocalOrPrivateHost(url.hostname)) {
      url.protocol = "http:";
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:5173";
  }
}

function tryStableBase(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const url = new URL(t);
    if (isEphemeralTunnelHost(url.hostname)) return null;
    return normalizeFrontendBase(t);
  } catch {
    return null;
  }
}

/**
 * Canonical public app URL from configuration only.
 * Ignores ephemeral tunnel hosts so stale quick-tunnel env vars do not leak into links.
 */
export function resolveConfiguredFrontendBase(): string {
  const configured = [
    process.env.FRONTEND_URL || "",
    process.env.VERT_URL || "",
    process.env.BACKEND_URL || "",
  ];

  for (const candidate of configured) {
    const stable = tryStableBase(candidate);
    if (stable) return stable;
  }

  return "http://localhost:5173";
}

/**
 * Public base URL for share links, emails, etc.
 * 1) FRONTEND_URL when set — always (canonical prod URL; avoids tunnel Host/Origin).
 * 2) Else Origin / X-Forwarded-* — but never *.trycloudflare.com and similar.
 */
export function resolveFrontendBase(req: Request): string {
  const envBase = (process.env.FRONTEND_URL || "").trim();
  const stableEnvBase = tryStableBase(envBase);
  if (stableEnvBase) {
    return stableEnvBase;
  }

  const origin = String(req.headers.origin || "").trim();
  const fromOrigin = tryStableBase(origin);
  if (fromOrigin) return fromOrigin;

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "")
    .split(",")[0]
    .trim();
  if (forwardedProto && forwardedHost) {
    const fromFwd = tryStableBase(`${forwardedProto}://${forwardedHost}`);
    if (fromFwd) return fromFwd;
  }

  const host = String(req.headers.host || "").split(",")[0].trim();
  if (host) {
    const inferredProto =
      forwardedProto || (req.secure ? "https" : "http");
    const fromHost = tryStableBase(`${inferredProto}://${host}`);
    if (fromHost) return fromHost;
  }

  return resolveConfiguredFrontendBase();
}
