import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { Pool } from "pg";
import { prisma } from "./lib/prisma";

import authRoutes from "./routes/auth.routes";
import filesRoutes from "./routes/files.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
