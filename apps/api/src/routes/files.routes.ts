import express, { Request, Response } from "express";

import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import multer from "multer";
import { Pool } from "pg";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import favoritesRoutes from "./favorite.routes";

const filesRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit per file
  },
});

filesRoutes.use("/favorites", favoritesRoutes);

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
            ],
          );

          return {
            originalName: originalName,
            s3Key,
            folderPath,
            size: file.size,
            mimeType: file.mimetype,
          };
        },
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

      const fileResult = await pool.query(
        `SELECT s3_key FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
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

      await pool.query(
        `DELETE FROM user_files WHERE id = $1 AND user_id = $2`,
        [fileId, req.userId],
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
  },
);

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

export default filesRoutes;
