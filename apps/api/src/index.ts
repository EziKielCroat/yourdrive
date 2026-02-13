import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import storageRoutes from "./routes/storage.routes";

import { Pool } from "pg";
import { prisma } from "./lib/prisma";

import authRoutes from "./routes/auth.routes";
import filesRoutes from "./routes/files.routes";
import settingsRoutes from "./routes/settings.routes";
import sharingRoutes from "./routes/sharing.routes";
import devicesRoutes from "./routes/devices.routes";
import conversionRoutes from "./routes/conversion.routes";
import fileActionsRoutes from "./routes/fileActions.routes";

dotenv.config();

// Startup check: warn if required env is missing (avoids cryptic Prisma/DB errors later)
if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "❌ DATABASE_URL is not set. Create apps/api/.env from apps/api/.env.example and set DATABASE_URL to your PostgreSQL connection string.",
  );
  process.exit(1);
}

const app = express();
const PORT: number = parseInt(process.env.PORT ?? "3000", 10);
const HOST: string = process.env.HOST ?? "0.0.0.0";

// Allowed origins for CORS (localhost + FRONTEND_URL + LAN in dev)
const normalizeOrigin = (url: string) => url?.trim().replace(/\/$/, "") || "";

function isAllowedOriginHost(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.endsWith(".local")
    );
  } catch {
    return false;
  }
}

// Build allowed origins: defaults + FRONTEND_URL + optional CORS_ORIGINS (comma-separated for self-hosting)
const corsOriginsEnv = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://5n3w3hsd-5173.euw.devtunnels.ms",
  process.env.FRONTEND_URL,
  ...corsOriginsEnv,
]
  .filter((url): url is string => Boolean(url))
  .map(normalizeOrigin);

// Helmet: relax COOP/origin-agent-cluster so HTTP dev origins don't trigger console warnings
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    originAgentCluster: false,
  }),
);
// Remove Permissions-Policy so browsers don't complain about unrecognized features (e.g. browsing-topics, interest-cohort)
app.use((_req, res, next) => {
  res.removeHeader("Permissions-Policy");
  next();
});
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      // Always allow localhost and private LAN (any port/scheme) so http://192.168.1.2:5173 works even when FRONTEND_URL is https
      if (isAllowedOriginHost(origin)) {
        return callback(null, true);
      }
      // Allow Cloudflare quick tunnels: any subdomain of trycloudflare.com
      try {
        const host = new URL(origin).hostname.toLowerCase();
        if (host.endsWith(".trycloudflare.com")) return callback(null, true);
      } catch {
        // ignore
      }
      if (origin.toLowerCase().includes("trycloudflare.com")) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["ETag"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
    ],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/sharing", sharingRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/file-actions", fileActionsRoutes);
app.use("/api/storage", storageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/version", (req, res) => {
  res.json({ version: "1.10" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err?.stack ?? err);
    if (!res.headersSent) {
      res.status(err.status || 500).json({
        success: false,
        error:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : (err?.message ?? "Internal server error"),
      });
    }
  },
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

const server = app.listen(PORT, HOST, () => {
  const base =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(
    `✅ API server running on ${base} (listening on ${HOST}:${PORT})`,
  );
});

server.timeout = 120000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
