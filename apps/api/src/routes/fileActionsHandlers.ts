import { Request, Response } from "express";
import { Pool } from "pg";
import { s3Client } from "./files.routes";
import {
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildContentDisposition } from "../lib/contentDisposition";
import archiver from "archiver";
import unzipper from "unzipper";
import { Readable } from "stream";
import crypto from "crypto";

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

export async function checkFileOwnership(
  pool: Pool,
  fileIds: string[],
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM user_files WHERE id = ANY($1) AND user_id = $2`,
    [fileIds.map((id) => parseInt(id)), userId],
  );
  return parseInt(result.rows[0].count) === fileIds.length;
}

export async function checkFileAccess(
  pool: Pool,
  fileId: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `SELECT id FROM user_files WHERE id = $1 AND user_id = $2`,
    [parseInt(fileId), userId],
  );
  return result.rows.length > 0;
}

export async function getFileDetails(
  pool: Pool,
  fileId: string,
  userId: string,
): Promise<any> {
  const result = await pool.query(
    `SELECT * FROM user_files WHERE id = $1 AND user_id = $2`,
    [parseInt(fileId), userId],
  );
  return result.rows[0] || null;
}

export async function downloadFromS3(s3Key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Key,
  });

  const { Body } = await s3Client.send(command);

  if (!Body) {
    throw new Error("Failed to download file from S3");
  }

  if (Body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  throw new Error("Invalid S3 response body");
}

export function generateUniqueFilename(
  userId: string,
  originalName: string,
): string {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(4).toString("hex");
  return `${userId}/${timestamp}-${randomStr}-${originalName}`;
}

export function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    csv: "text/csv",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    bz2: "application/x-bzip2",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    json: "application/json",
    xml: "application/xml",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export class FileActionsHandlers {
  constructor(private pool: Pool) {}

  async handleStar(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      for (const fileId of fileIds) {
        await client.query(
          `INSERT INTO favorited_files (user_id, file_id, favorited_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id, file_id) DO NOTHING`,
          [userId, parseInt(fileId)],
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${fileIds.length} file(s) starred`,
        data: { starredIds: fileIds },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Star error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to star files",
      });
    } finally {
      client.release();
    }
  }

  async handleUnstar(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const result = await client.query(
        `DELETE FROM favorited_files 
         WHERE user_id = $1 AND file_id = ANY($2)
         RETURNING file_id`,
        [userId, fileIds.map((id) => parseInt(id))],
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${result.rows.length} file(s) unstarred`,
        data: { unstarredIds: result.rows.map((row) => row.file_id) },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Unstar error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to unstar files",
      });
    } finally {
      client.release();
    }
  }

  async handleDelete(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const movedFiles = [];

      for (const fileId of fileIds) {
        try {
          const fileResult = await client.query(
            `SELECT * FROM user_files WHERE id = $1 AND user_id = $2`,
            [parseInt(fileId), userId],
          );

          if (fileResult.rows.length === 0) {
            console.warn(`File ${fileId} not found, skipping`);
            continue;
          }

          const file = fileResult.rows[0];

          if (file.is_locked) {
            console.warn(`File ${fileId} is locked, skipping`);
            continue;
          }

          await client.query(
            `INSERT INTO recycle_bin 
             (user_id, file_id, original_name, s3_key, user_email, mime_type, size, folder_path, deleted_at, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)
             ON CONFLICT (user_id, file_id) 
             DO UPDATE SET deleted_at = NOW()`,
            [
              userId,
              file.id,
              file.original_name,
              file.s3_key,
              file.user_email,
              file.mime_type,
              file.size,
              file.folder_path || "",
              file.created_at || new Date(),
            ],
          );

          await client.query(
            `DELETE FROM user_files WHERE id = $1 AND user_id = $2`,
            [file.id, userId],
          );

          await client.query(
            `DELETE FROM favorited_files WHERE file_id = $1 AND user_id = $2`,
            [file.id, userId],
          );

          movedFiles.push(file.id);
        } catch (fileErr) {
          console.error(
            `Failed to move file ${fileId} to recycle bin:`,
            fileErr,
          );
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${movedFiles.length} file(s) moved to recycle bin`,
        data: {
          deletedIds: movedFiles,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Delete error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to move files to recycle bin",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      client.release();
    }
  }

  async handleDeletePermanently(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const permanentlyDeletedFiles = [];

      for (const fileId of fileIds) {
        try {
          const recycleResult = await client.query(
            `SELECT * FROM recycle_bin WHERE file_id = $1 AND user_id = $2`,
            [parseInt(fileId), userId],
          );

          if (recycleResult.rows.length === 0) {
            console.warn(`File ${fileId} not found in recycle bin, skipping`);
            continue;
          }

          const file = recycleResult.rows[0];

          try {
            await s3Client.send(
              new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: file.s3_key,
              }),
            );
          } catch (s3Error) {
            console.error(`Failed to delete S3 file ${file.s3_key}:`, s3Error);
          }

          await client.query(
            `DELETE FROM recycle_bin WHERE file_id = $1 AND user_id = $2`,
            [file.file_id, userId],
          );

          permanentlyDeletedFiles.push(file.file_id);
        } catch (fileErr) {
          console.error(
            `Failed to permanently delete file ${fileId}:`,
            fileErr,
          );
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${permanentlyDeletedFiles.length} file(s) permanently deleted`,
        data: {
          deletedIds: permanentlyDeletedFiles,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Permanent delete error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to permanently delete files",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      client.release();
    }
  }

  async getRecycleBinContents(
    userId: string | undefined,
    req: Request,
    res: Response,
  ) {
    try {
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const result = await this.pool.query(
        `SELECT 
          file_id as id,
          original_name,
          s3_key,
          user_email,
          mime_type,
          size,
          folder_path,
          deleted_at,
          created_at
         FROM recycle_bin 
         WHERE user_id = $1 
         ORDER BY deleted_at DESC`,
        [userId],
      );

      res.json({
        success: true,
        files: result.rows,
      });
    } catch (err) {
      console.error("Get recycle bin error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get recycle bin contents",
      });
    }
  }

  async handleRestore(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const restoredFiles = [];

      for (const fileId of fileIds) {
        try {
          const recycleResult = await client.query(
            `SELECT * FROM recycle_bin WHERE file_id = $1 AND user_id = $2`,
            [parseInt(fileId), userId],
          );

          if (recycleResult.rows.length === 0) {
            console.warn(`File ${fileId} not found in recycle bin, skipping`);
            continue;
          }

          const file = recycleResult.rows[0];

          // Check if file already exists in user_files (shouldn't happen, but safety check)
          const existingCheck = await client.query(
            `SELECT id FROM user_files WHERE id = $1 AND user_id = $2`,
            [file.file_id, userId],
          );

          if (existingCheck.rows.length > 0) {
            console.warn(
              `File ${fileId} already exists in user_files, just removing from recycle_bin`,
            );
            await client.query(
              `DELETE FROM recycle_bin WHERE file_id = $1 AND user_id = $2`,
              [file.file_id, userId],
            );
            restoredFiles.push(file.file_id);
            continue;
          }

          await client.query(
            `INSERT INTO user_files 
             (id, user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, NOW())`,
            [
              file.file_id,
              userId,
              file.user_email,
              file.original_name,
              file.s3_key,
              file.folder_path || "",
              file.size,
              file.mime_type,
              file.created_at || new Date(),
            ],
          );

          await client.query(
            `DELETE FROM recycle_bin WHERE file_id = $1 AND user_id = $2`,
            [file.file_id, userId],
          );

          await client.query(
            `SELECT setval('user_files_id_seq', (SELECT MAX(id) FROM user_files))`,
          );

          restoredFiles.push(file.file_id);
        } catch (fileErr) {
          console.error(`Failed to restore file ${fileId}:`, fileErr);
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${restoredFiles.length} file(s) restored from recycle bin`,
        data: {
          restoredIds: restoredFiles,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Restore error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to restore files",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      client.release();
    }
  }

  async handleRename(
    fileId: string,
    newName: string,
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !newName || typeof newName !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid file name",
        });
      }

      if (newName.trim().length === 0 || newName.length > 255) {
        return res.status(400).json({
          success: false,
          error: "File name must be between 1 and 255 characters",
        });
      }

      const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
      if (invalidChars.test(newName)) {
        return res.status(400).json({
          success: false,
          error: "File name contains invalid characters",
        });
      }

      await client.query("BEGIN");

      const ownsFile = await checkFileAccess(this.pool, fileId, userId);
      if (!ownsFile) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          success: false,
          error: "Permission denied",
        });
      }

      const result = await client.query(
        `UPDATE user_files 
         SET original_name = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3
         RETURNING id, original_name, updated_at`,
        [newName.trim(), parseInt(fileId), userId],
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "File renamed successfully",
        data: result.rows[0],
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Rename error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to rename file",
      });
    } finally {
      client.release();
    }
  }

  async handleDuplicate(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "fileIds array is required",
        });
      }

      await client.query("BEGIN");

      const duplicatedFiles = [];

      for (const fileId of fileIds) {
        try {
          const file = await getFileDetails(this.pool, fileId, userId);
          if (!file) {
            console.warn(`File ${fileId} not found, skipping`);
            continue;
          }

          if (file.is_folder) {
            console.warn(`File ${fileId} is a folder, skipping`);
            continue;
          }

          const nameParts = file.original_name.split(".");
          let newFileName;
          if (nameParts.length > 1) {
            const extension = nameParts.pop();
            const baseName = nameParts.join(".");
            newFileName = `${baseName} (copy).${extension}`;
          } else {
            newFileName = `${file.original_name} (copy)`;
          }

          const newS3Key = generateUniqueFilename(userId, newFileName);
          await s3Client.send(
            new CopyObjectCommand({
              Bucket: BUCKET_NAME,
              CopySource: `${BUCKET_NAME}/${file.s3_key}`,
              Key: newS3Key,
            }),
          );

          const newFile = await client.query(
            `INSERT INTO user_files 
             (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
             RETURNING *`,
            [
              userId,
              file.user_email,
              newFileName,
              newS3Key,
              file.folder_path || "",
              file.size,
              file.mime_type,
            ],
          );

          duplicatedFiles.push(newFile.rows[0]);
        } catch (fileErr) {
          console.error(`Failed to duplicate file ${fileId}:`, fileErr);
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${duplicatedFiles.length} file(s) duplicated successfully`,
        data: duplicatedFiles,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Duplicate error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to duplicate files",
      });
    } finally {
      client.release();
    }
  }

  async handleMove(
    fileIds: string[],
    targetFolderPath: string,
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      if (fileIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files selected",
        });
      }

      await client.query("BEGIN");

      const lockCheck = await client.query(
        `SELECT id FROM user_files 
         WHERE id = ANY($1) AND user_id = $2 AND is_locked = true`,
        [fileIds.map((id) => parseInt(id)), userId],
      );

      if (lockCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          success: false,
          error: "One or more files are locked and cannot be moved",
        });
      }

      if (targetFolderPath && targetFolderPath !== "") {
        const folderCheck = await client.query(
          `SELECT id FROM user_files 
           WHERE folder_path = $1 AND user_id = $2 AND is_folder = true`,
          [targetFolderPath, userId],
        );

        if (folderCheck.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(404).json({
            success: false,
            error: "Target folder does not exist",
          });
        }
      }

      const result = await client.query(
        `UPDATE user_files 
         SET folder_path = $1, updated_at = NOW()
         WHERE id = ANY($2) AND user_id = $3 AND is_folder = false
         RETURNING id`,
        [targetFolderPath, fileIds.map((id) => parseInt(id)), userId],
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${result.rows.length} file(s) moved successfully`,
        data: { movedCount: result.rows.length },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Move error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to move files",
      });
    } finally {
      client.release();
    }
  }

  async handleLock(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE user_files 
         SET is_locked = true, updated_at = NOW()
         WHERE id = ANY($1) AND user_id = $2
         RETURNING id, is_locked`,
        [fileIds.map((id) => parseInt(id)), userId],
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${result.rows.length} file(s) locked successfully`,
        data: {
          lockedIds: result.rows.map((row) => row.id),
          files: result.rows,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Lock error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to lock files",
      });
    } finally {
      client.release();
    }
  }

  async handleUnlock(
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE user_files 
         SET is_locked = false, updated_at = NOW()
         WHERE id = ANY($1) AND user_id = $2
         RETURNING id, is_locked`,
        [fileIds.map((id) => parseInt(id)), userId],
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `${result.rows.length} file(s) unlocked successfully`,
        data: {
          unlockedIds: result.rows.map((row) => row.id),
          files: result.rows,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Unlock error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to unlock files",
      });
    } finally {
      client.release();
    }
  }

  async handleCompress(
    fileIds: string[],
    archiveName: string,
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const filesResult = await client.query(
        `SELECT * FROM user_files WHERE id = ANY($1) AND user_id = $2 AND is_folder = false`,
        [fileIds.map((id) => parseInt(id)), userId],
      );

      if (filesResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          error: "No files found",
        });
      }

      const files = filesResult.rows;
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      const archivePromise = new Promise<Buffer>((resolve, reject) => {
        archive.on("data", (chunk) => chunks.push(chunk));
        archive.on("end", () => resolve(Buffer.concat(chunks)));
        archive.on("error", reject);
      });

      for (const file of files) {
        try {
          const fileBuffer = await downloadFromS3(file.s3_key);
          archive.append(fileBuffer, { name: file.original_name });
        } catch (err) {
          console.error(`Failed to add file ${file.original_name}:`, err);
        }
      }

      await archive.finalize();
      const zipBuffer = await archivePromise;

      const zipFileName = archiveName || `archive-${Date.now()}.zip`;
      const zipS3Key = generateUniqueFilename(userId, zipFileName);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: zipS3Key,
          Body: zipBuffer,
          ContentType: "application/zip",
        }),
      );

      const userEmail = files[0].user_email;
      const newFile = await client.query(
        `INSERT INTO user_files 
         (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
         VALUES ($1, $2, $3, $4, '', $5, 'application/zip', false, NOW(), NOW())
         RETURNING *`,
        [userId, userEmail, zipFileName, zipS3Key, zipBuffer.length],
      );

      await client.query("COMMIT");

      const downloadCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: zipS3Key,
      });
      const downloadUrl = await getSignedUrl(s3Client, downloadCommand, {
        expiresIn: 300,
      });

      res.json({
        success: true,
        message: "Archive created successfully",
        downloadUrl,
        fileName: zipFileName,
        data: {
          file: newFile.rows[0],
          compressedFiles: files.length,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Compress error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to create archive",
      });
    } finally {
      client.release();
    }
  }

  async handleExtract(
    fileId: string,
    targetFolderPath: string,
    userId: string,
    req: Request,
    res: Response,
  ) {
    const client = await this.pool.connect();
    try {
      if (!userId || !fileId) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await client.query("BEGIN");

      const file = await getFileDetails(this.pool, fileId, userId);
      if (!file) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      const archiveTypes = [
        "application/zip",
        "application/x-zip",
        "application/x-zip-compressed",
        "multipart/x-zip",
      ];

      const isZipByExtension = file.original_name.match(
        /\.(zip|rar|7z|tar|gz|bz2)$/i,
      );
      const isZipByMime = archiveTypes.includes(file.mime_type);

      if (!isZipByExtension && !isZipByMime) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: "File is not a valid archive",
        });
      }

      const archiveBuffer = await downloadFromS3(file.s3_key);
      const directory = await unzipper.Open.buffer(archiveBuffer);
      const extractedFiles: any[] = [];

      for (const entry of directory.files) {
        if (entry.type === "File") {
          try {
            const fileBuffer = await entry.buffer();
            const fileName = entry.path.split("/").pop() || entry.path;

            const newS3Key = generateUniqueFilename(userId, fileName);
            const extension = fileName.split(".").pop() || "";

            await s3Client.send(
              new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: newS3Key,
                Body: fileBuffer,
                ContentType: getMimeType(extension),
              }),
            );

            const newFileRecord = await client.query(
              `INSERT INTO user_files 
               (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
               RETURNING *`,
              [
                userId,
                file.user_email,
                fileName,
                newS3Key,
                targetFolderPath || "",
                fileBuffer.length,
                getMimeType(extension),
              ],
            );

            extractedFiles.push(newFileRecord.rows[0]);
          } catch (err) {
            console.error(`Failed to extract file ${entry.path}:`, err);
          }
        }
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `Extracted ${extractedFiles.length} file(s) successfully`,
        data: {
          extractedCount: extractedFiles.length,
          files: extractedFiles,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Extract error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to extract archive",
      });
    } finally {
      client.release();
    }
  }

  async handleGetLink(
    fileId: string,
    userId: string,
    req: Request,
    res: Response,
  ) {
    try {
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const file = await getFileDetails(this.pool, fileId, userId);
      if (!file) {
        return res.status(404).json({
          success: false,
          error: "File not found",
        });
      }

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3_key,
        ResponseContentDisposition: buildContentDisposition("inline", file.original_name, true),
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 7 * 24 * 60 * 60,
      });

      const shareableLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/${file.id}`;

      res.json({
        success: true,
        link: signedUrl,
        shareableLink: shareableLink,
        expiresIn: "7 day(s)",
        fileName: file.original_name,
      });
    } catch (err) {
      console.error("Get link error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to get link",
      });
    }
  }

  async handleBatch(
    operation: string,
    fileIds: string[],
    userId: string,
    req: Request,
    res: Response,
  ) {
    switch (operation) {
      case "star":
        return await this.handleStar(fileIds, userId, req, res);
      case "unstar":
        return await this.handleUnstar(fileIds, userId, req, res);
      case "delete":
        return await this.handleDelete(fileIds, userId, req, res);
      case "restore":
        return await this.handleRestore(fileIds, userId, req, res);
      case "deletePermanently":
        return await this.handleDeletePermanently(fileIds, userId, req, res);
      case "duplicate":
        return await this.handleDuplicate(fileIds, userId, req, res);
      case "lock":
        return await this.handleLock(fileIds, userId, req, res);
      case "unlock":
        return await this.handleUnlock(fileIds, userId, req, res);
      case "move":
        const { targetFolderPath = "" } = req.body;
        return await this.handleMove(
          fileIds,
          targetFolderPath,
          userId,
          req,
          res,
        );
      case "compress":
        const { archiveName } = req.body;
        return await this.handleCompress(
          fileIds,
          archiveName,
          userId,
          req,
          res,
        );
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown batch operation: ${operation}`,
        });
    }
  }
}
