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
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { trackFileActivity } from "../lib/helper";
import favoritesRoutes from "./favorite.routes";

import fs from "fs";
import path from "path";
import { promisify } from "util";

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

      const result = await s3Client.send(command);

      return res.json({
        success: true,
        partNumber: parseInt(partNumber),
        ETag: result.ETag,
      });
    } catch (err) {
      console.error("Error uploading chunk:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to upload chunk" });
    }
  },
);

// Step 1: Initialize multipart upload

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
         WHERE user_id = $1 AND file_hash = $2 AND folder_path = $3
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

// Step 2: Get presigned URL for uploading a part
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

// Step 3: Complete multipart upload
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

      // Save metadata + HASH
      await pool.query(
        `INSERT INTO user_files 
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, file_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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

// Step 4: Abort multipart upload (cleanup on cancel/error)
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

// Get user's files
filesRoutes.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const result = await pool.query(
      `SELECT id, original_name, s3_key, folder_path, size, mime_type, created_at
         FROM user_files
         WHERE user_id = $1
         ORDER BY created_at DESC`,
      [req.userId],
    );

    res.json({
      success: true,
      files: result.rows,
    });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch files",
    });
  }
});

// Get user's folders
filesRoutes.get("/folders", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const result = await pool.query(
      `SELECT 
        CASE 
          WHEN folder_path = '' OR folder_path IS NULL THEN NULL
          ELSE SPLIT_PART(folder_path, '/', 1)
        END as root_folder,
        folder_path,
        COUNT(*) as file_count,
        SUM(size) as total_size
       FROM user_files
       WHERE user_id = $1
       GROUP BY folder_path
       ORDER BY COUNT(*) DESC`,
      [req.userId],
    );

    const folderMap = new Map<
      string,
      { fileCount: number; totalSize: number; subfolders: Set<string> }
    >();

    result.rows.forEach((row) => {
      const folderPath = row.folder_path || "";

      if (!folderPath) {
        // Files without a folder path - skip for "Suggested Folders"
        // Or you can include them as "My Files" / "Unsorted"
        return;
      }

      const rootFolder = folderPath.split("/")[0];

      if (!folderMap.has(rootFolder)) {
        folderMap.set(rootFolder, {
          fileCount: 0,
          totalSize: 0,
          subfolders: new Set(),
        });
      }

      const folder = folderMap.get(rootFolder)!;
      folder.fileCount += parseInt(row.file_count, 10);
      folder.totalSize += parseInt(row.total_size, 10);

      if (folderPath !== rootFolder) {
        folder.subfolders.add(folderPath);
      }
    });

    const folders = Array.from(folderMap.entries()).map(([name, data]) => ({
      name,
      path: name,
      fileCount: data.fileCount,
      totalSize: data.totalSize,
      hasSubfolders: data.subfolders.size > 0,
    }));

    // Sort by file count descending
    folders.sort((a, b) => b.fileCount - a.fileCount);

    res.json({
      success: true,
      folders,
    });
  } catch (err) {
    console.error("Error fetching folders:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch folders",
    });
  }
});

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

      // Fetch files shared with the user
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
        u.name AS owner_name,
        u.email AS owner_email,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END AS is_favorited
      FROM share_recipients sr
      JOIN file_shares fs ON fs.id = sr.share_id
      JOIN user_files uf ON uf.id = fs.file_id
      JOIN "User" u ON u.id = fs.owner_id
      LEFT JOIN favorited_files f
        ON f.user_id = $1 AND f.file_id = uf.id
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
        isFavorited: row.is_favorited,
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

// Get recycle bin files
filesRoutes.get(
  "/recycle-bin",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const userId = req.userId;
    const client = await pool.connect();

    try {
      const result = await client.query(
        `
        SELECT
          file_id,
          original_name,
          s3_key,
          user_email,
          mime_type,
          size,
          folder_path,
          deleted_at
        FROM recycle_bin
        WHERE user_id = $1
        ORDER BY deleted_at DESC
      `,
        [userId],
      );

      res.json({ success: true, files: result.rows });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch recycle bin" });
    } finally {
      client.release();
    }
  },
);

// Delete file with id (move to recycle bin)
filesRoutes.post(
  "/delete/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const fileRes = await client.query(
        `SELECT * FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, userId],
      );

      if (!fileRes.rowCount) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ success: false, error: "File not found" });
      }

      const file = fileRes.rows[0];
      console.log("Moving file to recycle bin:", file);

      await client.query(
        `INSERT INTO recycle_bin (
          user_id, 
          file_id, 
          original_name, 
          mime_type, 
          size, 
          folder_path, 
          s3_key, 
          user_email,
          deleted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, file_id) 
        DO UPDATE SET deleted_at = CURRENT_TIMESTAMP`,
        [
          userId,
          file.id,
          file.original_name,
          file.mime_type,
          file.size,
          file.folder_path,
          file.s3_key,
          file.user_email,
        ],
      );

      await client.query(
        `DELETE FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, userId],
      );

      await client.query("COMMIT");

      console.log(`File ${fileId} successfully moved to recycle bin`);

      res.json({
        success: true,
        message: "File moved to Recycle Bin",
        fileId: file.id,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Delete operation failed:", err);
      res.status(500).json({
        success: false,
        error: "Delete failed",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      client.release();
    }
  },
);

// Restore file from recycle bin
filesRoutes.post(
  "/recycle-bin/restore/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const recycleRes = await client.query(
        `SELECT * FROM recycle_bin WHERE user_id = $1 AND file_id = $2`,
        [userId, fileId],
      );

      if (!recycleRes.rowCount) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ success: false, error: "File not in recycle bin" });
      }

      const file = recycleRes.rows[0];
      console.log("Restoring file from recycle bin:", file);

      const existingFile = await client.query(
        `SELECT id FROM user_files WHERE id = $1`,
        [file.file_id],
      );

      if (existingFile.rowCount > 0) {
        console.log(
          "File already exists in user_files, just removing from recycle bin",
        );
        await client.query(
          `DELETE FROM recycle_bin WHERE user_id = $1 AND file_id = $2`,
          [userId, fileId],
        );
      } else {
        const insertResult = await client.query(
          `INSERT INTO user_files (
            id, 
            user_id, 
            user_email, 
            original_name, 
            s3_key, 
            folder_path, 
            size, 
            mime_type, 
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
          RETURNING id`,
          [
            file.file_id,
            file.user_id,
            file.user_email,
            file.original_name,
            file.s3_key,
            file.folder_path || "",
            file.size,
            file.mime_type,
          ],
        );

        console.log("File restored with ID:", insertResult.rows[0].id);

        await client.query(
          `SELECT setval('user_files_id_seq', (SELECT MAX(id) FROM user_files))`,
        );

        await client.query(
          `DELETE FROM recycle_bin WHERE user_id = $1 AND file_id = $2`,
          [userId, fileId],
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "File restored successfully",
        fileId: file.file_id,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Restore failed:", err);
      res.status(500).json({
        success: false,
        error: "Restore failed",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      client.release();
    }
  },
);

// Delete file from recycle bin
filesRoutes.post(
  "/recycle-bin/delete/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { fileId } = req.params;
    const userId = req.userId;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `DELETE FROM recycle_bin WHERE user_id = $1 AND file_id = $2`,
        [userId, fileId],
      );

      await client.query("COMMIT");
      res.json({ success: true, message: "File permanently deleted" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(err);
      res
        .status(500)
        .json({ success: false, error: "Permanent delete failed" });
    } finally {
      client.release();
    }
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

    // Get files edited in the last X days
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

    res.json({
      success: true,
      files: result.rows,
      count: result.rows.length,
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
