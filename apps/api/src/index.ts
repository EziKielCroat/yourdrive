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
// CORS: allow ALL origins so tunnel/self-host always works (no "blocked by CORS" on 4xx/5xx).
// With credentials we must reflect the request origin, not "*".
app.use(
  cors({
    origin: (origin, callback) => callback(null, origin ?? true),
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
// Ensure CORS headers on EVERY response (including errors) so browser never shows "CORS error" for 500s.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  next();
});
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
      const origin = req.headers.origin;
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
      }
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

// 404 handler (CORS headers already set by middleware above)
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
