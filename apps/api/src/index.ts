import express from "express";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Pool } from "pg";

import authRoutes from "./routes/auth.routes";

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

const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    const userId = (req as any).user?.id || "anonymous";

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = Array.isArray(req.files) ? req.files : [];

    const uploadPromises = files.map(async (file: any) => {
      const timestamp = Date.now();
      const path = file.webkitRelativePath || file.originalname;
      const s3Key = `users/${userId}/${timestamp}_${path}`;

      const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
        },
      };

      const parallelUpload = new Upload({
        client: s3Client,
        params: uploadParams,
      });

      await parallelUpload.done();

      const folderPath = s3Key
        .replace(`users/${userId}/`, "")
        .replace(file.originalname, "");

      // Save metadata to PostgreSQL
      await pool.query(
        `INSERT INTO user_files (user_id, original_name, s3_key, folder_path, size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, file.originalname, s3Key, folderPath, file.size, file.mimetype]
      );

      return {
        originalName: file.originalname,
        s3Key,
        folderPath,
        size: file.size,
        mimeType: file.mimetype,
      };
    });

    const results = await Promise.all(uploadPromises);
    res.json({ success: true, files: results });
  } catch (err) {
    console.error("Upload error:", err);
    res
      .status(500)
      .json({ success: false, error: "Upload failed", details: err });
  }
});

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

app.get("/api/version", (req, res) => {
  res.json({ version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
