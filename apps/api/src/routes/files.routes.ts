import express, { Request, Response } from "express";

import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import multer from "multer";
import { Pool } from "pg";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const filesRoutes = express.Router();

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit per file
  },
});

filesRoutes.post(
  "/upload",
  authMiddleware,
  upload.array("files"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, email: true },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
        });
      }

      const files = Array.isArray(req.files) ? req.files : [];

      // Parse folder paths from request body (sent as JSON string)
      let folderPaths: Record<string, string> = {};
      if (req.body.folderPaths) {
        try {
          folderPaths = JSON.parse(req.body.folderPaths);
        } catch (e) {
          console.error("Failed to parse folderPaths:", e);
        }
      }

      const uploadPromises = files.map(
        async (file: Express.Multer.File, index: number) => {
          const timestamp = Date.now();
          const originalName = file.originalname;

          // Get folder path from the parsed metadata
          const folderPath = folderPaths[index.toString()] || "";

          // Build S3 key with folder structure
          const s3Key = folderPath
            ? `users/${user.email}/${folderPath}/${timestamp}_${originalName}`
            : `users/${user.email}/${timestamp}_${originalName}`;

          const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
              originalName: originalName,
              uploadDate: new Date().toISOString(),
              userId: user.id,
              userEmail: user.email,
              folderPath: folderPath,
            },
          };

          const parallelUpload = new Upload({
            client: s3Client,
            params: uploadParams,
          });

          await parallelUpload.done();

          await pool.query(
            `INSERT INTO user_files (user_id, user_email, original_name, s3_key, folder_path, size, mime_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              user.id,
              user.email,
              originalName,
              s3Key,
              folderPath,
              file.size,
              file.mimetype,
            ]
          );

          return {
            originalName: originalName,
            s3Key,
            folderPath,
            size: file.size,
            mimeType: file.mimetype,
          };
        }
      );

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        files: results,
        message: `Successfully uploaded ${results.length} file(s)`,
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({
        success: false,
        error: "Upload failed",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
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
      [req.userId]
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

// Get user's folders (aggregated from file paths)
filesRoutes.get("/folders", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get unique top-level folders with file counts and total sizes
    // This extracts the first segment of folder_path as the "root" folder
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
      [req.userId]
    );

    // Aggregate by root folder (top-level folder name)
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

      // Get the root folder (first segment)
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

      // Track subfolders for potential nested view
      if (folderPath !== rootFolder) {
        folder.subfolders.add(folderPath);
      }
    });

    // Convert to array format
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

filesRoutes.delete(
  "/:fileId",
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

      // Get file info
      const fileResult = await pool.query(
        `SELECT s3_key FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId]
      );

      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      // TODO: Delete from B2 as well
      // const s3Key = fileResult.rows[0].s3_key;
      // await s3Client.send(new DeleteObjectCommand({
      //   Bucket: BUCKET_NAME,
      //   Key: s3Key,
      // }));

      // Delete from database
      await pool.query(
        `DELETE FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId]
      );

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      res.status(500).json({
        success: false,
        error: "Failed to delete file",
      });
    }
  }
);

export default filesRoutes;
