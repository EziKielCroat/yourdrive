import "./env"; // must be first — loads .env before prisma is required

import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { Pool } from "pg";
import { prisma } from "./lib/prisma";

import authRoutes from "./routes/auth.routes";
import filesRoutes from "./routes/files.routes";
import storageRoutes from "./routes/storage.routes";
import settingsRoutes from "./routes/settings.routes";
import sharingRoutes from "./routes/sharing.routes";
import devicesRoutes from "./routes/devices.routes";
import conversionRoutes from "./routes/conversion.routes";
import fileActionsRoutes from "./routes/fileActions.routes";
import supportRoutes from "./routes/support.routes";


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
// CORS: reflect request origin so cross-origin (e.g. frontend at 192.168.1.2:5173, API at :3000) works.
// In development, allow any http(s) origin so register works from any device on the network.
app.use((req, res, next) => {
  const origin = (req.headers.origin || "").trim();
  const frontendUrl = (process.env.FRONTEND_URL || "").trim();

  let allowOrigin: string;
  if (origin) {
    allowOrigin = origin;
  } else if (frontendUrl) {
    allowOrigin = frontendUrl;
  } else {
    allowOrigin = "*";
  }

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  if (allowOrigin !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.setHeader("Access-Control-Expose-Headers", "ETag");
  if (req.method === "OPTIONS") return res.status(204).end();
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
app.use("/api/support", supportRoutes);

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
      const msg = typeof err?.message === "string" ? err.message : "Internal server error";
      res.status(err.status || 500).json({
        success: false,
        error: msg,
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

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

// Upload-related routes (including anonymous tryout uploads) can take longer on slower networks.
// Keep long request timeout to avoid premature socket termination during large file processing.
server.timeout = TEN_MINUTES_MS;
server.requestTimeout = TEN_MINUTES_MS;
server.keepAliveTimeout = ONE_MINUTE_MS;
server.headersTimeout = ONE_MINUTE_MS + 1000;
