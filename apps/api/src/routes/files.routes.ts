import express, { Request, Response } from "express";

import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import multer from "multer";
import { Pool } from "pg";

import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  GetObjectCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { trackFileActivity, generateShortId } from "../lib/helper";
import { resolveFrontendBase } from "../lib/frontend-base";
import { buildContentDisposition } from "../lib/contentDisposition";
import favoritesRoutes from "./favorite.routes";

import fs from "fs";
import path from "path";
import { promisify } from "util";
import { FileActionsHandlers } from "./fileActionsHandlers";
import { ensureWelcomeReadme } from "../services/welcomeReadme.service";
import { Readable } from "stream";
import crypto from "crypto";

const filesRoutes = express.Router();

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const CHUNKS_DIR = path.join(process.cwd(), "temp", "chunks");

export const s3Client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: "eu-central-003",
  forcePathStyle: true,
  useArnRegion: false,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID ?? "",
    secretAccessKey: process.env.B2_APPLICATION_KEY ?? "",
  },
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

function inferMimeTypeFromName(fileName: string): string | undefined {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return undefined;

  // Minimal mapping for common previewable types
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    case "txt":
      return "text/plain; charset=utf-8";
    case "md":
      return "text/markdown; charset=utf-8";
    case "json":
      return "application/json; charset=utf-8";
    case "csv":
      return "text/csv; charset=utf-8";
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "ogg":
      return "audio/ogg";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    default:
      return undefined;
  }
}

(async () => {
  try {
    await mkdir(CHUNKS_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create chunks directory:", err);
  }
})();

const directUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
});

const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per chunk
  },
});

filesRoutes.use("/favorites", favoritesRoutes);

/** @deprecated Prefer POST /api/storage/ensure-welcome-readme — kept for older clients. */
filesRoutes.post(
  "/ensure-welcome-readme",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId || !BUCKET_NAME) {
        return res
          .status(401)
          .json({ success: false, error: "Unauthorized" });
      }
      const result = await ensureWelcomeReadme(
        req.userId,
        s3Client,
        BUCKET_NAME,
      );
      return res.json({ success: true, ...result });
    } catch (err) {
      console.error("ensure-welcome-readme (files) error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to ensure welcome README",
      });
    }
  },
);

// Anonymous upload endpoint (for Tryout feature)
filesRoutes.post(
  "/anonymous-upload",
  directUpload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          error: "No file provided",
        });
      }

      // Limit to 50MB for anonymous uploads
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          error: "File size exceeds 50MB limit",
        });
      }

      if (!BUCKET_NAME) {
        console.error("BUCKET_NAME is not configured");
        return res.status(500).json({
          success: false,
          error: "Server configuration error",
        });
      }

      // Generate anonymous user ID and unique file name (avoid duplicate key for same user/folder/name)
      const anonymousId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext) || "file";
      const uniqueOriginalName = `${baseName}-${Date.now()}${ext}`;
      const s3Key = `anonymous/${anonymousId}/${file.originalname}`;

      // Upload to S3
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();

      // Create a temporary file record in database
      // First, find or create an anonymous user
      let anonymousUser = await pool.query(
        `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
        ["anonymous@yourdrive.local"]
      );

      let userId: string;
      if (anonymousUser.rows.length === 0) {
        // Create anonymous user if it doesn't exist
        // Use actual database column names (snake_case for mapped fields)
        const newUser = await pool.query(
          `INSERT INTO "User" (id, email, password, first_name, "emailVerified", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id`,
          [
            crypto.randomUUID(),
            "anonymous@yourdrive.local",
            crypto.randomBytes(32).toString("hex"),
            "Anonymous",
            false,
          ]
        );
        userId = newUser.rows[0].id;
      } else {
        userId = anonymousUser.rows[0].id;
      }

      // Create file record (use unique original_name so Tryout uploads never hit duplicate constraint)
      const fileRecord = await pool.query(
        `INSERT INTO user_files 
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
         RETURNING id`,
        [
          userId,
          "anonymous@yourdrive.local",
          uniqueOriginalName,
          s3Key,
          "",
          file.size,
          file.mimetype,
        ]
      );

      const fileId = fileRecord.rows[0].id;

      // Create share link (expires in 7 days)
      const shareToken = crypto.randomBytes(32).toString("hex");
      const shortId = generateShortId();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const shareId = crypto.randomUUID();

      await pool.query(
        `INSERT INTO file_shares 
         (id, file_id, owner_id, share_token, short_id, share_type, permission, expires_at, max_downloads, download_count, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          shareId,
          fileId,
          userId,
          shareToken,
          shortId,
          "link",
          "view",
          expiresAt,
          null,
          0,
          true,
        ]
      );

      const frontendUrl = resolveFrontendBase(req);
      const shareUrl = `${frontendUrl}/shared/${shareToken}`;
      const shortUrl = `${frontendUrl}/s/${shortId}`;

      res.json({
        success: true,
        shareToken,
        shareUrl,
        shortUrl,
        fileName: file.originalname,
        fileSize: file.size,
        expiresAt: expiresAt.toISOString(),
        message: "File uploaded successfully. Share link created.",
      });
    } catch (err: any) {
      console.error("Anonymous upload error:", err);
      if (err?.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "A file with this name was already uploaded. Please use a different name or try again.",
        });
      }
      res.status(500).json({
        success: false,
        error: err?.message || "Upload failed",
      });
    }
  },
);

// Upload files
filesRoutes.post(
  "/upload",
  authMiddleware,
  directUpload.array("files", 50),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files provided",
        });
      }

      const folderPaths = req.body.folderPaths
        ? JSON.parse(req.body.folderPaths)
        : {};

      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const folderPath = folderPaths[i] || "";

        const s3Key = `${userId}/${Date.now()}-${file.originalname}`;

        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
          },
        });

        await upload.done();
        try {
          const result = await pool.query(
            `INSERT INTO user_files 
             (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
             VALUES ($1, (SELECT email FROM "User" WHERE id = $1), $2, $3, $4, $5, $6, false, NOW(), NOW())
             RETURNING id, original_name, s3_key, folder_path, size, mime_type, created_at, updated_at`,
            [
              userId,
              file.originalname,
              s3Key,
              folderPath,
              file.size,
              file.mimetype,
            ],
          );
          uploadedFiles.push(result.rows[0]);
        } catch (insertErr: any) {
          if (insertErr?.code === "23505") {
            return res.status(409).json({
              success: false,
              error: `A file named "${file.originalname}" already exists in this folder. Rename or remove the existing file first.`,
            });
          }
          throw insertErr;
        }
      }

      res.json({
        success: true,
        files: uploadedFiles,
        count: uploadedFiles.length,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err?.code === "23505") {
        return res.status(409).json({
          success: false,
          error: "A file with this name already exists in this folder.",
        });
      }
      res.status(500).json({
        success: false,
        error: "Upload failed",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

filesRoutes.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

      const filesResult = await pool.query(
        `SELECT 
        uf.id, 
        uf.original_name, 
        uf.s3_key, 
        uf.folder_path, 
        uf.size, 
        uf.mime_type, 
        uf.created_at,
        uf.updated_at,
        uf.is_folder,
        uf.is_locked,
        CASE WHEN ff.id IS NOT NULL THEN true ELSE false END AS is_favorited
       FROM user_files uf
       LEFT JOIN favorited_files ff ON ff.file_id = uf.id AND ff.user_id = $1
       WHERE uf.user_id = $1 AND (uf.original_name != '.metadata' OR uf.is_folder = true)
       ORDER BY uf.is_folder DESC, uf.created_at DESC`,
        [req.userId],
      );

    const transformedFiles = filesResult.rows.map((row) => ({
      id: row.id,
      name: row.is_folder ? (row.folder_path?.split("/").filter(Boolean).pop() || row.original_name) : row.original_name,
      mimeType: row.mime_type,
      size: parseInt(row.size, 10),
      folderPath: row.folder_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      type: row.is_folder ? "folder" : "file",
      isLocked: row.is_locked || false,
      isStarred: row.is_favorited || false,
      s3Key: row.s3_key,
    }));

    res.json({
      success: true,
      files: transformedFiles,
    });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch files",
    });
  }
});

// Get unique people from user's files (for filtering)
// NOTE: Currently we only have reliable data for the signed-in user,
// so the people list is limited to "Me". This avoids relying on
// non-existent tables like `share_recipients`.
filesRoutes.get("/people", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const result = await pool.query(
      `SELECT id, COALESCE(first_name, email) AS name, email
       FROM "User"
       WHERE id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, people: [] });
    }

    const row = result.rows[0];
    const people = [
      {
        id: row.id,
        name: row.name,
        email: row.email,
        isYou: true,
      },
    ];

    return res.json({ success: true, people });
  } catch (err) {
    console.error("Error fetching people:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch people" });
  }
});

// Get user's folders (for sidebar/suggested folders)
filesRoutes.get("/folders", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const foldersResult = await pool.query(
      `SELECT 
        folder_path as path,
        created_at
       FROM user_files
       WHERE user_id = $1 
         AND is_folder = true
       ORDER BY created_at DESC`,
      [userId],
    );

    const foldersWithStats = await Promise.all(
      foldersResult.rows.map(async (folder) => {
        const stats = await pool.query(
          `SELECT 
            COUNT(id) as file_count,
            COALESCE(SUM(size), 0) as total_size
           FROM user_files
           WHERE user_id = $1 
             AND folder_path = $2
             AND is_folder = false`,
          [userId, folder.path],
        );

        return {
          name: folder.path.split("/").pop() || folder.path,
          path: folder.path,
          fileCount: Number(stats.rows[0].file_count),
          totalSize: Number(stats.rows[0].total_size),
          isEmpty: Number(stats.rows[0].file_count) === 0,
          createdAt: folder.created_at,
        };
      }),
    );

    res.json({ success: true, folders: foldersWithStats });
  } catch (err) {
    console.error("Error fetching folders:", err);
    res.status(500).json({ success: false, error: "Failed to fetch folders" });
  }
});

// Create folder
filesRoutes.post(
  "/folders/create",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { folderPath } = req.body;
      const userId = req.userId;

      if (!folderPath || !userId) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      const existing = await pool.query(
        `SELECT id FROM user_files 
         WHERE user_id = $1 
           AND folder_path = $2 
           AND is_folder = true
         LIMIT 1`,
        [userId, folderPath],
      );

      if (existing.rows.length > 0) {
        return res.json({
          success: true,
          folder: { folder_path: folderPath },
          message: "Folder already exists",
        });
      }

      // Create .metadata file in S3
      const s3Key = `${userId}/${folderPath}/.metadata`;
      const metadataContent = JSON.stringify({
        type: "folder",
        name: folderPath.split("/").pop(),
        created_at: new Date().toISOString(),
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: Buffer.from(metadataContent),
          ContentType: "application/json",
        }),
      );

      const result = await pool.query(
        `INSERT INTO user_files 
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
         VALUES ($1, (SELECT email FROM "User" WHERE id = $1), '.metadata', $2, $3, $4, 'application/json', true, NOW(), NOW())
         RETURNING id, folder_path, created_at`,
        [userId, s3Key, folderPath, metadataContent.length],
      );

      res.json({
        success: true,
        folder: {
          ...result.rows[0],
          name: folderPath.split("/").pop(),
          path: folderPath,
        },
      });
    } catch (err) {
      console.error("Error creating folder:", err);
      res.status(500).json({
        success: false,
        error: "Failed to create folder",
      });
    }
  },
);

// Multipart upload endpoints
filesRoutes.post(
  "/init-multipart-upload",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      const {
        fileName,
        fileSize,
        mimeType,
        folderPath = "",
        fileHash,
      } = req.body;

      if (!fileHash)
        return res.status(400).json({
          success: false,
          error: "Missing fileHash (SHA-256 required)",
        });

      const dupe = await pool.query(
        `SELECT * FROM user_files
         WHERE user_id = $1 AND file_hash = $2 AND folder_path = $3 AND is_folder = false
         LIMIT 1`,
        [userId, fileHash, folderPath],
      );

      if (dupe.rows.length > 0) {
        return res.json({
          success: false,
          duplicate: true,
          existingFile: dupe.rows[0],
        });
      }

      const s3Key = `${userId}/${Date.now()}-${fileName}`;

      const multipart = await s3Client.send(
        new CreateMultipartUploadCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          ContentType: mimeType,
        }),
      );

      return res.json({
        success: true,
        uploadId: multipart.UploadId,
        s3Key,
      });
    } catch (err) {
      console.error("init-multipart-upload error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  },
);

filesRoutes.post(
  "/get-upload-url",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { uploadId, s3Key, partNumber } = req.body;

      if (!uploadId || !s3Key || !partNumber)
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });

      const command = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        UploadId: uploadId,
        PartNumber: parseInt(partNumber),
      });

      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });

      return res.json({
        success: true,
        uploadUrl,
        partNumber: parseInt(partNumber),
      });
    } catch (err) {
      console.error("Error generating upload URL:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to generate upload URL" });
    }
  },
);

filesRoutes.post(
  "/upload-chunk",
  authMiddleware,
  chunkUpload.single("chunk"),
  async (req: AuthRequest, res) => {
    try {
      const { uploadId, s3Key, partNumber } = req.body;
      const chunk = req.file;

      if (!uploadId || !s3Key || !partNumber || !chunk)
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });

      const command = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        UploadId: uploadId,
        PartNumber: parseInt(partNumber),
        Body: chunk.buffer,
      });

      const response = await s3Client.send(command);

      return res.json({
        success: true,
        ETag: response.ETag,
      });
    } catch (err) {
      console.error("Error uploading chunk:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to upload chunk" });
    }
  },
);

filesRoutes.post(
  "/complete-multipart-upload",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { id: true, email: true },
      });

      if (!user)
        return res
          .status(404)
          .json({ success: false, error: "User not found" });

      const {
        uploadId,
        s3Key,
        fileName,
        fileSize,
        mimeType,
        folderPath = "",
        fileHash,
        parts,
      } = req.body;

      if (!uploadId || !s3Key || !fileName || !parts || !fileHash)
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });

      const command = new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p: any) => ({
            PartNumber: p.PartNumber,
            ETag: p.ETag,
          })),
        },
      });

      await s3Client.send(command);

      await pool.query(
        `INSERT INTO user_files 
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, file_hash, is_folder, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW())`,
        [
          user.id,
          user.email,
          fileName,
          s3Key,
          folderPath,
          fileSize,
          mimeType,
          fileHash,
        ],
      );

      return res.json({
        success: true,
        file: {
          originalName: fileName,
          s3Key,
          folderPath,
          size: fileSize,
          mimeType,
          fileHash,
        },
      });
    } catch (err) {
      console.error("Error completing multipart upload:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to complete upload" });
    }
  },
);

filesRoutes.post(
  "/abort-multipart-upload",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { uploadId, s3Key } = req.body;

      if (!uploadId || !s3Key)
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });

      const command = new AbortMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        UploadId: uploadId,
      });

      await s3Client.send(command);

      return res.json({ success: true, message: "Upload aborted" });
    } catch (err) {
      console.error("Abort upload error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to abort upload" });
    }
  },
);

// Delete to recycle bin (same behavior as batch delete)
filesRoutes.delete(
  "/soft/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    const { fileId } = req.params;
    const fileActions = new FileActionsHandlers(pool);
    return fileActions.handleDelete([fileId], req.userId, req, res);
  },
);

// Get user's usage stats
filesRoutes.get("/usage", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_files,
        COALESCE(SUM(size), 0) as total_size
       FROM user_files
       WHERE user_id = $1
         AND deleted_at IS NULL
         AND is_system_readme = false`,
      [req.userId],
    );

    const stats = result.rows[0];

    res.json({
      success: true,
      usage: {
        totalFiles: parseInt(stats.total_files, 10),
        totalSize: parseInt(stats.total_size, 10),
      },
    });
  } catch (err) {
    console.error("Error fetching usage stats:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch usage statistics",
    });
  }
});

// Get download for specific file
filesRoutes.get(
  "/download/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { fileId } = req.params;

      const fileResult = await pool.query(
        `SELECT id, original_name, s3_key, mime_type, size
         FROM user_files
         WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      const file = fileResult.rows[0];

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3_key,
        ResponseContentDisposition: buildContentDisposition(
          "attachment",
          file.original_name,
          true,
        ),
        ResponseContentType:
          file.mime_type ||
          inferMimeTypeFromName(file.original_name) ||
          "application/octet-stream",
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      res.json({
        success: true,
        file: {
          id: file.id,
          name: file.original_name,
          mimeType: file.mime_type,
          size: file.size,
          downloadUrl: signedUrl,
        },
      });

      // Option 2: Stream preko servera

      // const getObjectCommand = new GetObjectCommand({
      //   Bucket: BUCKET_NAME,
      //   Key: file.s3_key,
      // });
      //
      // const { Body, ContentType } = await s3Client.send(getObjectCommand);
      //
      // res.setHeader('Content-Type', ContentType || file.mime_type);
      // res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
      //
      // if (Body instanceof require('stream').Readable) {
      //   Body.pipe(res);
      // } else {
      //   res.status(500).json({ success: false, error: 'Invalid file stream' });
      // }
    } catch (err) {
      console.error("Error downloading file:", err);
      res.status(500).json({
        success: false,
        error: "Failed to download file",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Authenticated, same-origin file stream (for fetch-based previews)
filesRoutes.head(
  "/blob/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { fileId } = req.params;
      const fileResult = await pool.query(
        `SELECT id, original_name, s3_key, mime_type, size
         FROM user_files
         WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: "File not found" });
      }

      const file = fileResult.rows[0];

      // Prefer DB values; fall back to inferred
      const contentType =
        file.mime_type ||
        inferMimeTypeFromName(file.original_name) ||
        "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      if (file.size) res.setHeader("Content-Length", String(file.size));
      res.setHeader(
        "Content-Disposition",
        buildContentDisposition("inline", file.original_name),
      );
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");

      return res.status(200).end();
    } catch (err) {
      console.error("Error in HEAD /blob:", err);
      return res.status(500).end();
    }
  },
);

filesRoutes.get(
  "/blob/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { fileId } = req.params;
      const fileResult = await pool.query(
        `SELECT id, original_name, s3_key, mime_type, size
         FROM user_files
         WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: "File not found" });
      }

      const file = fileResult.rows[0];
      const contentType =
        file.mime_type ||
        inferMimeTypeFromName(file.original_name) ||
        "application/octet-stream";

      // Optional Range support (single range)
      const range = req.headers.range;
      let start: number | undefined;
      let end: number | undefined;
      let statusCode = 200;

      if (typeof range === "string") {
        const match = range.match(/bytes=(\d*)-(\d*)/i);
        if (match) {
          start = match[1] ? Number(match[1]) : undefined;
          end = match[2] ? Number(match[2]) : undefined;
          if (
            (start !== undefined && Number.isNaN(start)) ||
            (end !== undefined && Number.isNaN(end))
          ) {
            start = undefined;
            end = undefined;
          } else {
            statusCode = 206;
          }
        }
      }

      const totalSize = file.size ? Number(file.size) : undefined;
      const resolvedStart = start ?? 0;
      const resolvedEnd =
        end ?? (totalSize !== undefined ? totalSize - 1 : undefined);

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3_key,
        ...(statusCode === 206 && resolvedEnd !== undefined
          ? { Range: `bytes=${resolvedStart}-${resolvedEnd}` }
          : {}),
      });

      const s3Resp = await s3Client.send(command);

      res.status(statusCode);
      res.setHeader("Content-Type", s3Resp.ContentType || contentType);
      res.setHeader(
        "Content-Disposition",
        buildContentDisposition("inline", file.original_name),
      );
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");

      const contentLength =
        s3Resp.ContentLength ?? (totalSize !== undefined ? totalSize : undefined);

      if (statusCode === 206 && totalSize !== undefined) {
        const crEnd = resolvedEnd ?? totalSize - 1;
        res.setHeader("Content-Range", `bytes ${resolvedStart}-${crEnd}/${totalSize}`);
        res.setHeader("Content-Length", String(crEnd - resolvedStart + 1));
      } else if (contentLength !== undefined) {
        res.setHeader("Content-Length", String(contentLength));
      }

      const body = s3Resp.Body;
      if (body instanceof Readable) {
        body.pipe(res);
        return;
      }

      return res.status(500).json({
        success: false,
        error: "Invalid file stream",
      });
    } catch (err) {
      console.error("Error streaming file /blob:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to stream file",
      });
    }
  },
);

// Get file content (signed URL)
filesRoutes.get(
  "/content/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { fileId } = req.params;

      // Fetch file metadata from DB (include created_at, updated_at for preview sidebar)
      const fileResult = await pool.query(
        `SELECT id, original_name, s3_key, mime_type, created_at, updated_at
         FROM user_files
         WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      const file = fileResult.rows[0];

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3_key,
        ResponseContentDisposition: buildContentDisposition(
          "inline",
          file.original_name,
          true,
        ),
        ResponseContentType:
          file.mime_type ||
          inferMimeTypeFromName(file.original_name) ||
          "application/octet-stream",
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      res.json({
        success: true,
        signedUrl,
        mimeType: file.mime_type,
        fileName: file.original_name,
        fileId: file.id,
        created_at: file.created_at,
        updated_at: file.updated_at,
      });
    } catch (err) {
      console.error("Error loading file content:", err);
      res.status(500).json({
        success: false,
        error: "Failed to load file content",
      });
    }
  },
);

// Edit textual file content (authenticated, text-based files only)
filesRoutes.post(
  "/edit/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { fileId } = req.params;
      const { content } = req.body as { content?: string };

      if (typeof content !== "string") {
        return res.status(400).json({
          success: false,
          error: "Content must be a string",
        });
      }

      const fileResult = await pool.query(
        `SELECT id, original_name, s3_key, mime_type, size
         FROM user_files
         WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      const file = fileResult.rows[0] as {
        id: number;
        original_name: string;
        s3_key: string;
        mime_type: string | null;
        size: string;
      };

      const mimeType = (file.mime_type || "").toLowerCase();
      const isTextFile =
        mimeType.startsWith("text/") ||
        mimeType === "application/json" ||
        mimeType === "application/xml" ||
        mimeType === "application/javascript";

      if (!isTextFile) {
        return res.status(400).json({
          success: false,
          error: "Only text-based files can be edited",
        });
      }

      const effectiveMime =
        file.mime_type ||
        inferMimeTypeFromName(file.original_name) ||
        "text/plain; charset=utf-8";

      // Write updated content back to the same B2/S3 object key
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.s3_key,
          Body: Buffer.from(content, "utf-8"),
          ContentType: effectiveMime,
        }),
      );

      const newSize = Buffer.byteLength(content, "utf-8");

      await pool.query(
        `UPDATE user_files
         SET size = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3`,
        [String(newSize), file.id, req.userId],
      );

      return res.json({
        success: true,
        message: "File updated successfully",
        fileSize: newSize,
      });
    } catch (err) {
      console.error("Error editing file:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to edit file",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Get folder contents
filesRoutes.get(
  "/folder-contents",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { path } = req.query;

      if (!path || typeof path !== "string") {
        return res.status(400).json({
          success: false,
          error: "Folder path is required",
        });
      }

      // Get all files that match this folder path or are in subfolders
      const filesResult = await pool.query(
        `SELECT id, original_name, s3_key, folder_path, size, mime_type, created_at
       FROM user_files
       WHERE user_id = $1 AND folder_path LIKE $2 AND original_name != '.metadata'
       ORDER BY original_name ASC`,
        [req.userId, `${path}%`],
      );

      const files: Array<{
        name: string;
        size: number;
        path: string;
        id: number;
      }> = [];
      const subfolders = new Set<string>();

      filesResult.rows.forEach((row) => {
        const folderPath = row.folder_path || "";

        // Check if file is directly in this folder (exact match)
        if (folderPath === path) {
          files.push({
            id: row.id,
            name: row.original_name,
            size: parseInt(row.size, 10),
            path: row.folder_path,
          });
        } else if (folderPath.startsWith(path + "/")) {
          const relativePath = folderPath.substring(path.length + 1);
          const nextFolder = relativePath.split("/")[0];

          if (nextFolder) {
            subfolders.add(nextFolder);
          }
        }
      });

      const folders = Array.from(subfolders).map((name) => ({
        name,
        path: `${path}/${name}`,
      }));

      res.json({
        success: true,
        content: {
          files,
          folders,
        },
      });
    } catch (err) {
      console.error("Error fetching folder contents:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch folder contents",
      });
    }
  },
);

// Get user's shared with me files
filesRoutes.get(
  "/shared-with-me",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      if (!userId)
        return res.status(401).json({ success: false, error: "Unauthorized" });

      // Check if share_recipients table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'share_recipients'
        );
      `);

      const tableExists = tableCheck.rows[0]?.exists;

      if (!tableExists) {
        // Table doesn't exist, return empty array gracefully
        console.warn("share_recipients table does not exist, returning empty shared files");
        return res.json({ success: true, sharedFiles: [] });
      }

      const sharedResult = await pool.query(
        `
      SELECT
        fs.id AS share_id,
        fs.file_id,
        fs.permission,
        fs.share_type,
        fs.expires_at,
        uf.original_name,
        uf.size,
        uf.mime_type,
        uf.folder_path,
        uf.is_locked,
        u.name AS owner_name,
        u.email AS owner_email,
        CASE WHEN ff.id IS NOT NULL THEN true ELSE false END AS is_favorited
      FROM share_recipients sr
      JOIN file_shares fs ON fs.id = sr.share_id
      JOIN user_files uf ON uf.id = fs.file_id
      JOIN "User" u ON u.id = fs.owner_id
      LEFT JOIN favorited_files ff
        ON ff.user_id = $1 AND ff.file_id = uf.id
      WHERE sr.recipient_user_id = $1
        AND fs.is_active = true
      ORDER BY fs.created_at DESC
      `,
        [userId],
      );

      const sharedFiles = sharedResult.rows.map((row) => ({
        share_id: row.share_id,
        file_id: row.file_id,
        original_name: row.original_name,
        size: row.size,
        mime_type: row.mime_type,
        folder_path: row.folder_path,
        permission: row.permission,
        share_type: row.share_type,
        expires_at: row.expires_at,
        owner_name: row.owner_name,
        owner_email: row.owner_email,
        is_locked: row.is_locked || false,
        is_favorited: row.is_favorited || false,
      }));

      return res.json({ success: true, sharedFiles });
    } catch (err) {
      console.error("Error fetching shared-with-me files:", err);
      // Return empty array instead of 500 error to prevent frontend crashes
      return res.json({ success: true, sharedFiles: [] });
    }
  },
);

filesRoutes.get(
  "/recycle-bin",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const userId = req.userId;
    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.getRecycleBinContents(userId, req, res);
  },
);

filesRoutes.post(
  "/delete/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.handleDelete([fileId as string], userId, req, res);
  },
);

filesRoutes.post(
  "/recycle-bin/restore/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.handleRestore([fileId as string], userId, req, res);
  },
);

// Delete file from recycle bin
filesRoutes.post(
  "/recycle-bin/delete/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.handleDeletePermanently(
      [fileId as string],
      userId,
      req,
      res,
    );
  },
);

// Get recently edited files
filesRoutes.get("/recent", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Parse and validate query parameters
    const daysParam = req.query.days;
    const limitParam = req.query.limit;
    const scopeParam = req.query.scope;
    
    const days = daysParam ? parseInt(String(daysParam), 10) : 30;
    const limit = limitParam ? parseInt(String(limitParam), 10) : 50;
    const scope = scopeParam === "activity" ? "activity" : "edited";

    // Validate parsed values
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({
        success: false,
        error: "Invalid days parameter. Must be between 1 and 365",
      });
    }

    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return res.status(400).json({
        success: false,
        error: "Invalid limit parameter. Must be between 1 and 1000",
      });
    }

    // Activity scope powers Home -> Recent Files.
    // It intentionally includes uploads/updates/shares, not only explicit edits.
    if (scope === "activity") {
      const ownResult = await pool.query(
        `
        SELECT
          uf.id,
          uf.original_name,
          uf.s3_key,
          uf.folder_path,
          uf.size,
          uf.mime_type,
          uf.created_at,
          uf.updated_at,
          uf.is_locked,
          GREATEST(uf.created_at, uf.updated_at) as last_edited_at,
          0 as edit_count,
          CASE WHEN ff.id IS NOT NULL THEN true ELSE false END AS is_favorited
        FROM user_files uf
        LEFT JOIN favorited_files ff ON ff.file_id = uf.id AND ff.user_id = $1
        WHERE uf.user_id = $1
          AND uf.deleted_at IS NULL
          AND uf.original_name != '.metadata'
          AND (
            uf.updated_at >= NOW() - INTERVAL '${days} days'
            OR uf.created_at >= NOW() - INTERVAL '${days} days'
          )
        ORDER BY GREATEST(uf.created_at, uf.updated_at) DESC
        LIMIT $2
        `,
        [req.userId, limit],
      );

      let activityFiles = ownResult.rows.map((row) => ({
        ...row,
        is_locked: row.is_locked || false,
        is_favorited: row.is_favorited || false,
        last_edited_at: row.last_edited_at || row.updated_at || row.created_at,
        edit_count: 0,
        is_shared: false,
        owner_name: null,
        owner_email: null,
      }));

      // Include shared-with-me files as recent activity (shared timeline).
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'share_recipients'
          );
        `);
        if (tableCheck.rows[0]?.exists) {
          const sharedResult = await pool.query(
            `
            SELECT
              uf.id,
              uf.original_name,
              uf.s3_key,
              uf.folder_path,
              uf.size,
              uf.mime_type,
              uf.created_at,
              uf.updated_at,
              uf.is_locked,
              fs.created_at AS last_edited_at,
              u.name AS owner_name,
              u.email AS owner_email,
              CASE WHEN ff.id IS NOT NULL THEN true ELSE false END AS is_favorited
            FROM share_recipients sr
            JOIN file_shares fs ON fs.id = sr.share_id
            JOIN user_files uf ON uf.id = fs.file_id
            JOIN "User" u ON u.id = fs.owner_id
            LEFT JOIN favorited_files ff ON ff.user_id = $1 AND ff.file_id = uf.id
            WHERE sr.recipient_user_id = $1
              AND fs.is_active = true
              AND (fs.expires_at IS NULL OR fs.expires_at > NOW())
              AND uf.deleted_at IS NULL
              AND fs.created_at >= NOW() - INTERVAL '${days} days'
            ORDER BY fs.created_at DESC
            LIMIT $2
            `,
            [req.userId, limit],
          );

          const sharedRows = sharedResult.rows.map((row) => ({
            id: row.id,
            original_name: row.original_name,
            s3_key: row.s3_key,
            folder_path: row.folder_path,
            size: row.size,
            mime_type: row.mime_type,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_locked: row.is_locked || false,
            is_favorited: row.is_favorited || false,
            last_edited_at: row.last_edited_at || row.updated_at || row.created_at,
            edit_count: 0,
            is_shared: true,
            owner_name: row.owner_name,
            owner_email: row.owner_email,
          }));

          activityFiles = activityFiles.concat(sharedRows);
          activityFiles.sort(
            (a, b) =>
              new Date(b.last_edited_at).getTime() -
              new Date(a.last_edited_at).getTime(),
          );
          activityFiles = activityFiles.slice(0, limit);
        }
      } catch {
        // Non-fatal: keep own files only
      }

      return res.json({
        success: true,
        files: activityFiles,
        count: activityFiles.length,
      });
    }

    let result;
    
    // Recently edited should only include files with explicit 'edited' activity.
    // Do not fall back to created_at/updated_at, because that incorrectly includes uploads.
    try {
      result = await pool.query(
        `
        SELECT 
          uf.id,
          uf.original_name,
          uf.s3_key,
          uf.folder_path,
          uf.size,
          uf.mime_type,
          uf.created_at,
          uf.updated_at,
          uf.is_locked,
          (
            SELECT created_at 
            FROM file_activity 
            WHERE file_id = uf.id 
              AND user_id = $1 
              AND activity_type = 'edited'
            ORDER BY created_at DESC 
            LIMIT 1
          ) as last_edited_at,
          (
            SELECT COUNT(*)
            FROM file_activity
            WHERE file_id = uf.id
              AND user_id = $1
              AND activity_type = 'edited'
              AND created_at >= NOW() - INTERVAL '${days} days'
          ) as edit_count,
          CASE WHEN ff.id IS NOT NULL THEN true ELSE false END AS is_favorited
        FROM user_files uf
        LEFT JOIN favorited_files ff ON ff.file_id = uf.id AND ff.user_id = $1
        WHERE uf.user_id = $1
          AND uf.deleted_at IS NULL
          AND uf.original_name != '.metadata'
          AND EXISTS (
            SELECT 1 FROM file_activity fa
            WHERE fa.file_id = uf.id
              AND fa.user_id = $1
              AND fa.activity_type = 'edited'
              AND fa.created_at >= NOW() - INTERVAL '${days} days'
          )
        ORDER BY last_edited_at DESC
        LIMIT $2
        `,
        [req.userId, limit],
      );
    } catch (queryError: any) {
      // If file_activity table doesn't exist, return an empty edited list.
      if (queryError?.code === '42P01' || queryError?.message?.includes('does not exist') || queryError?.message?.includes('relation "file_activity"')) {
        console.warn("file_activity table not found, returning empty recently edited list");
        result = { rows: [] };
      } else {
        // Re-throw if it's a different error
        throw queryError;
      }
    }

    let ownFiles = (result?.rows || []).map((row) => ({
      ...row,
      is_locked: row.is_locked || false,
      is_favorited: row.is_favorited || false,
      last_edited_at: row.last_edited_at || row.updated_at || row.created_at,
      edit_count: row.edit_count || 0,
      is_shared: false,
      owner_name: null,
      owner_email: null,
    }));

    // Include shared-with-me files only when THIS user edited them.
    try {
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'share_recipients'
        );
      `);
      if (tableCheck.rows[0]?.exists) {
        const sharedResult = await pool.query(
          `
          SELECT
            uf.id,
            uf.original_name,
            uf.s3_key,
            uf.folder_path,
            uf.size,
            uf.mime_type,
            uf.created_at,
            uf.updated_at,
            uf.is_locked,
            (
              SELECT created_at
              FROM file_activity fa
              WHERE fa.file_id = uf.id
                AND fa.user_id = $1
                AND fa.activity_type = 'edited'
              ORDER BY created_at DESC
              LIMIT 1
            ) AS last_edited_at,
            u.name AS owner_name,
            u.email AS owner_email,
            CASE WHEN ff.id IS NOT NULL THEN true ELSE false END AS is_favorited
          FROM share_recipients sr
          JOIN file_shares fs ON fs.id = sr.share_id
          JOIN user_files uf ON uf.id = fs.file_id
          JOIN "User" u ON u.id = fs.owner_id
          LEFT JOIN favorited_files ff ON ff.user_id = $1 AND ff.file_id = uf.id
          WHERE sr.recipient_user_id = $1
            AND fs.is_active = true
            AND (fs.expires_at IS NULL OR fs.expires_at > NOW())
            AND uf.deleted_at IS NULL
            AND EXISTS (
              SELECT 1
              FROM file_activity fa
              WHERE fa.file_id = uf.id
                AND fa.user_id = $1
                AND fa.activity_type = 'edited'
                AND fa.created_at >= NOW() - INTERVAL '${days} days'
            )
          ORDER BY last_edited_at DESC
          LIMIT $2
          `,
          [req.userId, limit],
        );
        const sharedRows = sharedResult.rows.map((row) => ({
          id: row.id,
          original_name: row.original_name,
          s3_key: row.s3_key,
          folder_path: row.folder_path,
          size: row.size,
          mime_type: row.mime_type,
          created_at: row.created_at,
          updated_at: row.updated_at,
          is_locked: row.is_locked || false,
          is_favorited: row.is_favorited || false,
          last_edited_at: row.last_edited_at || row.updated_at || row.created_at,
          edit_count: 0,
          is_shared: true,
          owner_name: row.owner_name,
          owner_email: row.owner_email,
        }));
        ownFiles = ownFiles.concat(sharedRows);
        ownFiles.sort(
          (a, b) =>
            new Date(b.last_edited_at).getTime() - new Date(a.last_edited_at).getTime(),
        );
        ownFiles = ownFiles.slice(0, limit);
      }
    } catch (sharedErr: any) {
      // Non-fatal: recent list stays as own files only
    }

    const files = ownFiles;

    res.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (err: any) {
    console.error("Error fetching recent files:", err);
    console.error("Error details:", {
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent files",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined,
    });
  }
});

// Track when a file is edited
filesRoutes.post(
  "/activity/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { fileId } = req.params;
      const { activityType, metadata } = req.body;

      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      await trackFileActivity(
        parseInt(fileId as string, 10),
        req.userId,
        activityType,
        metadata || {},
        pool,
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Error tracking activity:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to track activity" });
    }
  },
);

export default filesRoutes;
