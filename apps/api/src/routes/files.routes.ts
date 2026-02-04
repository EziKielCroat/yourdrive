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

import { trackFileActivity } from "../lib/helper";
import favoritesRoutes from "./favorite.routes";

import fs from "fs";
import path from "path";
import { promisify } from "util";
import { FileActionsHandlers } from "./fileActionsHandlers";

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
      }

      res.json({
        success: true,
        files: uploadedFiles,
        count: uploadedFiles.length,
      });
    } catch (err) {
      console.error("Upload error:", err);
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
       WHERE uf.user_id = $1
       ORDER BY uf.is_folder DESC, uf.created_at DESC`,
      [req.userId],
    );

    const transformedFiles = filesResult.rows.map((row) => ({
      id: row.id,
      name: row.original_name,
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
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder)
         VALUES ($1, (SELECT email FROM "User" WHERE id = $1), '.metadata', $2, $3, $4, 'application/json', true)
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
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, file_hash, is_folder)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)`,
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

// Delete to recycle bin
filesRoutes.delete(
  "/soft/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId)
        return res.status(401).json({ success: false, error: "Unauthorized" });

      const { fileId } = req.params;

      const file = await pool.query(
        `SELECT id FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
      );

      if (file.rows.length === 0)
        return res
          .status(404)
          .json({ success: false, error: "File not found" });

      // Insert into recycle bin
      await pool.query(
        `INSERT INTO recycle_bin (user_id, file_id, deleted_at)
       VALUES ($1, $2, NOW())`,
        [req.userId, fileId],
      );

      return res.json({ success: true, message: "Moved to Recycle Bin" });
    } catch (err) {
      console.error("Soft delete error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to soft delete file" });
    }
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
       WHERE user_id = $1`,
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

      // Fetch file metadata from DB
      const fileResult = await pool.query(
        `SELECT id, original_name, s3_key, mime_type
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
       WHERE user_id = $1 AND folder_path LIKE $2
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
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch shared files" });
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

    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.handleDelete([fileId], userId, req, res);
  },
);

filesRoutes.post(
  "/recycle-bin/restore/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.handleRestore([fileId], userId, req, res);
  },
);

// Delete file from recycle bin
filesRoutes.post(
  "/recycle-bin/delete/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    const fileActions = new FileActionsHandlers(pool);
    return await fileActions.handleDeletePermanently(
      [fileId],
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

    const { days = 30, limit = 50 } = req.query;

    const result = await pool.query(
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
        COALESCE(
          (SELECT created_at 
           FROM file_activity 
           WHERE file_id = uf.id 
             AND user_id = $1 
             AND activity_type = 'edited'
           ORDER BY created_at DESC 
           LIMIT 1),
          uf.updated_at
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
        AND (
          uf.updated_at >= NOW() - INTERVAL '${days} days'
          OR EXISTS (
            SELECT 1 FROM file_activity fa
            WHERE fa.file_id = uf.id
              AND fa.user_id = $1
              AND fa.activity_type = 'edited'
              AND fa.created_at >= NOW() - INTERVAL '${days} days'
          )
        )
      ORDER BY last_edited_at DESC
      LIMIT $2
      `,
      [req.userId, limit],
    );

    const files = result.rows.map((row) => ({
      ...row,
      is_locked: row.is_locked || false,
      is_favorited: row.is_favorited || false,
    }));

    res.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (err) {
    console.error("Error fetching recent files:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent files",
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
        parseInt(fileId),
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
