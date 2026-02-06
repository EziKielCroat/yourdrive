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




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://192.168.100.10:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use("/api/storage", storageRoutes);
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    exposedHeaders: ["ETag"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ PostgreSQL connection error:", err.stack);
  } else {
    console.log("✅ PostgreSQL connected");
    release();
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/files", filesRoutes);

app.use("/api/sharing", sharingRoutes);

app.use("/api/settings", settingsRoutes);

app.use("/api/devices", devicesRoutes);

app.use("/api/conversion", conversionRoutes);

app.use("/api/storage", storageRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

app.get("/api/version", (req, res) => {
  res.json({ version: "1.10" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await prisma.$disconnect();
  await pool.end();
  process.exit(0);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on http://0.0.0.0:${PORT}`);
});

server.timeout = 120000;
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;