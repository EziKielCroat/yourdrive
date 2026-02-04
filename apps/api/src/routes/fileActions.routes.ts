import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { Pool } from "pg";
import { s3Client } from "./files.routes";
import {
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import archiver from "archiver";
import { Readable } from "stream";
import sharp from "sharp";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import { FileActionsHandlers } from "./fileActionsHandlers";

const fileActionsRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME;
const handlers = new FileActionsHandlers(pool);

export async function checkFileAccess(
  pool: Pool,
  fileId: string,
  userId: string,
  checkDeleted: boolean = true,
): Promise<boolean> {
  // Since we're COMPLETELY deleting from user_files, we need to check recycle_bin for deleted files
  if (checkDeleted) {
    // Check in user_files (active files)
    const result = await pool.query(
      `SELECT id FROM user_files WHERE id = $1 AND user_id = $2`,
      [parseInt(fileId), userId],
    );
    return result.rows.length > 0;
  }

  // If not checking deleted, also check recycle_bin
  const userFilesCheck = await pool.query(
    `SELECT id FROM user_files WHERE id = $1 AND user_id = $2`,
    [parseInt(fileId), userId],
  );

  if (userFilesCheck.rows.length > 0) return true;

  // Check recycle_bin
  const recycleBinCheck = await pool.query(
    `SELECT file_id FROM recycle_bin WHERE file_id = $1 AND user_id = $2`,
    [parseInt(fileId), userId],
  );

  return recycleBinCheck.rows.length > 0;
}

export async function checkFileOwnership(
  pool: Pool,
  fileIds: string[],
  userId: string,
): Promise<boolean> {
  const userFilesCheck = await pool.query(
    `SELECT COUNT(*) as count FROM user_files WHERE id = ANY($1) AND user_id = $2`,
    [fileIds.map((id) => parseInt(id)), userId],
  );

  const recycleBinCheck = await pool.query(
    `SELECT COUNT(*) as count FROM recycle_bin WHERE file_id = ANY($1) AND user_id = $2`,
    [fileIds.map((id) => parseInt(id)), userId],
  );

  const totalCount =
    parseInt(userFilesCheck.rows[0].count) +
    parseInt(recycleBinCheck.rows[0].count);
  return totalCount === fileIds.length;
}

export async function getFileDetails(
  pool: Pool,
  fileId: string,
  userId: string,
  includeDeleted: boolean = false,
): Promise<any> {
  const userFileResult = await pool.query(
    `SELECT *, NULL as deleted_at FROM user_files WHERE id = $1 AND user_id = $2`,
    [parseInt(fileId), userId],
  );

  if (userFileResult.rows.length > 0) {
    return userFileResult.rows[0];
  }

  if (includeDeleted) {
    const recycleBinResult = await pool.query(
      `SELECT rb.* FROM recycle_bin rb 
       WHERE rb.file_id = $1 AND rb.user_id = $2`,
      [parseInt(fileId), userId],
    );

    if (recycleBinResult.rows.length > 0) {
      return recycleBinResult.rows[0];
    }
  }

  return null;
}

async function downloadFromS3(s3Key: string): Promise<Buffer> {
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

function generateUniqueFilename(userId: string, originalName: string): string {
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(4).toString("hex");
  return `${userId}/${timestamp}-${randomStr}-${originalName}`;
}

function getMimeType(extension: string): string {
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

fileActionsRoutes.post(
  "/star",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleStar(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.post(
  "/unstar",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleUnstar(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.post(
  "/delete",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleDelete(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.post(
  "/delete-permanently",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleDeletePermanently(
      req.body.fileIds,
      req.userId!,
      req,
      res,
    );
  },
);

fileActionsRoutes.post(
  "/restore",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleRestore(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.patch(
  "/rename/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleRename(
      req.params.fileId,
      req.body.newName,
      req.userId!,
      req,
      res,
    );
  },
);

fileActionsRoutes.post(
  "/duplicate",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleDuplicate(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.post(
  "/move",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleMove(
      req.body.fileIds,
      req.body.targetFolderPath || "",
      req.userId!,
      req,
      res,
    );
  },
);

fileActionsRoutes.post(
  "/lock",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleLock(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.post(
  "/unlock",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleUnlock(req.body.fileIds, req.userId!, req, res);
  },
);

fileActionsRoutes.post(
  "/compress",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleCompress(
      req.body.fileIds,
      req.body.archiveName,
      req.userId!,
      req,
      res,
    );
  },
);

fileActionsRoutes.post(
  "/extract",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleExtract(
      req.body.fileId,
      req.body.targetFolderPath || "",
      req.userId!,
      req,
      res,
    );
  },
);

fileActionsRoutes.get(
  "/get-link/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    await handlers.handleGetLink(req.params.fileId, req.userId!, req, res);
  },
);

// Batch operations endpoint
fileActionsRoutes.post(
  "/:operation/batch",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const { operation } = req.params;
    await handlers.handleBatch(
      operation,
      req.body.fileIds,
      req.userId!,
      req,
      res,
    );
  },
);

// Single file download
fileActionsRoutes.get(
  "/download/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { fileId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const file = await getFileDetails(fileId, userId);
      if (!file) {
        return res
          .status(404)
          .json({ success: false, error: "File not found" });
      }

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.s3_key,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.original_name)}"`,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      res.json({
        success: true,
        downloadUrl: url,
        fileName: file.original_name,
      });
    } catch (err) {
      console.error("Download error:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to download file" });
    }
  },
);

// Multiple files download
fileActionsRoutes.post(
  "/download",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { fileIds } = req.body;
      const userId = req.userId;

      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      const filesResult = await pool.query(
        `SELECT * FROM user_files WHERE id = ANY($1) AND user_id = $2 AND is_folder = false`,
        [fileIds, userId],
      );

      if (filesResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "No files found" });
      }

      const files = filesResult.rows;

      // Single file
      if (files.length === 1) {
        const file = files[0];
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.s3_key,
          ResponseContentDisposition: `attachment; filename="${encodeURIComponent(file.original_name)}"`,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        return res.json({
          success: true,
          downloadUrl: url,
          fileName: file.original_name,
        });
      }

      // Multiple files - create zip
      const archive = archiver("zip", { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on("data", (chunk) => chunks.push(chunk));
      archive.on("end", async () => {
        try {
          const zipBuffer = Buffer.concat(chunks);
          const zipName = `download-${Date.now()}.zip`;
          const zipS3Key = generateUniqueFilename(userId!, zipName);

          await s3Client.send(
            new PutObjectCommand({
              Bucket: BUCKET_NAME,
              Key: zipS3Key,
              Body: zipBuffer,
              ContentType: "application/zip",
            }),
          );

          const downloadCommand = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: zipS3Key,
          });

          const url = await getSignedUrl(s3Client, downloadCommand, {
            expiresIn: 300,
          });
          res.json({
            success: true,
            downloadUrl: url,
            fileName: zipName,
          });
        } catch (err) {
          console.error("Zip upload error:", err);
          res
            .status(500)
            .json({ success: false, error: "Failed to create download" });
        }
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
    } catch (err) {
      console.error("Download error:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to download files" });
    }
  },
);

// Share
fileActionsRoutes.post(
  "/share",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { fileIds } = req.body;
      const userId = req.userId;

      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      // TODO: Implement actual sharing logic
      res.json({
        success: true,
        message: `${fileIds.length} file(s) shared successfully`,
        data: { sharedIds: fileIds },
      });
    } catch (err) {
      console.error("Share error:", err);
      res.status(500).json({ success: false, error: "Failed to share files" });
    }
  },
);

// Optimize
fileActionsRoutes.post(
  "/optimize",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const client = await pool.connect();
    try {
      const {
        fileId,
        quality = 80,
        format = "jpeg",
        maxWidth = 1920,
      } = req.body;
      const userId = req.userId;

      if (!userId || !fileId) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      const file = await getFileDetails(fileId, userId);
      if (!file) {
        return res
          .status(404)
          .json({ success: false, error: "File not found" });
      }

      if (!file.mime_type.startsWith("image/")) {
        return res
          .status(400)
          .json({ success: false, error: "File is not an image" });
      }

      const originalBuffer = await downloadFromS3(file.s3_key);

      const optimizedBuffer = await sharp(originalBuffer)
        .resize({
          width: maxWidth,
          height: maxWidth,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({
          quality: Math.min(100, Math.max(10, quality)),
          mozjpeg: true,
        })
        .toBuffer();

      const nameParts = file.original_name.split(".");
      const baseName = nameParts.slice(0, -1).join(".") || file.original_name;
      const optimizedName = `${baseName}-optimized.jpg`;

      const newS3Key = generateUniqueFilename(userId, optimizedName);

      await client.query("BEGIN");

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: newS3Key,
          Body: optimizedBuffer,
          ContentType: "image/jpeg",
        }),
      );

      // Save optimized file to database with timestamps
      const newFile = await client.query(
        `INSERT INTO user_files 
       (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'image/jpeg', false, NOW(), NOW())
       RETURNING *`,
        [
          userId,
          file.user_email,
          optimizedName,
          newS3Key,
          file.folder_path || "",
          optimizedBuffer.length,
        ],
      );

      await client.query("COMMIT");

      const downloadCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newS3Key,
      });
      const downloadUrl = await getSignedUrl(s3Client, downloadCommand, {
        expiresIn: 300,
      });

      const savings = ((file.size - optimizedBuffer.length) / file.size) * 100;

      res.json({
        success: true,
        message: "Image optimized successfully",
        downloadUrl,
        fileName: optimizedName,
        data: {
          file: newFile.rows[0],
          originalSize: file.size,
          optimizedSize: optimizedBuffer.length,
          savings: `${Math.abs(savings).toFixed(1)}% ${savings > 0 ? "smaller" : "larger"}`,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Optimize error:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to optimize image" });
    } finally {
      client.release();
    }
  },
);

// Watermark
fileActionsRoutes.post(
  "/watermark",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const client = await pool.connect();
    try {
      const {
        fileIds,
        text = "Confidential",
        position = "bottom-right",
        opacity = 0.3,
      } = req.body;
      const userId = req.userId;

      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      const fileId = fileIds[0];
      const file = await getFileDetails(fileId, userId);

      if (!file) {
        return res
          .status(404)
          .json({ success: false, error: "File not found" });
      }

      if (!file.mime_type.startsWith("image/")) {
        return res
          .status(400)
          .json({ success: false, error: "Only images can be watermarked" });
      }

      const originalBuffer = await downloadFromS3(file.s3_key);
      const metadata = await sharp(originalBuffer).metadata();
      const { width, height } = metadata;

      if (!width || !height) {
        throw new Error("Could not read image dimensions");
      }

      const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .watermark {
            fill: white;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: 36px;
            opacity: ${opacity};
            text-anchor: ${position.includes("left") ? "start" : position.includes("right") ? "end" : "middle"};
          }
        </style>
        <text 
          x="${position.includes("left") ? "50" : position.includes("right") ? width - 50 : width / 2}" 
          y="${position.includes("top") ? "50" : position.includes("bottom") ? height - 50 : height / 2}" 
          class="watermark"
        >
          ${text}
        </text>
      </svg>
    `;

      const svgBuffer = Buffer.from(svgText);
      const watermarkedBuffer = await sharp(originalBuffer)
        .composite([{ input: svgBuffer, blend: "over" }])
        .jpeg({ quality: 90 })
        .toBuffer();

      const nameParts = file.original_name.split(".");
      const baseName = nameParts.slice(0, -1).join(".") || file.original_name;
      const extension = nameParts.length > 1 ? nameParts.pop() : "jpg";
      const watermarkedName = `${baseName}-watermarked.${extension}`;

      const newS3Key = generateUniqueFilename(userId, watermarkedName);

      await client.query("BEGIN");

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: newS3Key,
          Body: watermarkedBuffer,
          ContentType: file.mime_type,
        }),
      );

      // Save watermarked file to database with timestamps
      const newFile = await client.query(
        `INSERT INTO user_files 
       (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
       RETURNING *`,
        [
          userId,
          file.user_email,
          watermarkedName,
          newS3Key,
          file.folder_path || "",
          watermarkedBuffer.length,
          file.mime_type,
        ],
      );

      await client.query("COMMIT");

      const downloadCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: newS3Key,
      });
      const downloadUrl = await getSignedUrl(s3Client, downloadCommand, {
        expiresIn: 300,
      });

      res.json({
        success: true,
        message: "Watermark added successfully",
        downloadUrl,
        fileName: watermarkedName,
        data: {
          file: newFile.rows[0],
          watermarkedIds: fileIds,
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Watermark error:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to add watermark" });
    } finally {
      client.release();
    }
  },
);

// Generate PDF
fileActionsRoutes.post(
  "/generate-pdf",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const client = await pool.connect();
    try {
      const { fileIds, options = {} } = req.body;
      const userId = req.userId;

      if (!userId || !fileIds || !Array.isArray(fileIds)) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      const filesResult = await pool.query(
        `SELECT * FROM user_files WHERE id = ANY($1) AND user_id = $2 AND is_folder = false AND deleted_at IS NULL`,
        [fileIds, userId],
      );

      if (filesResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "No files found" });
      }

      const files = filesResult.rows;
      const pdfDoc = new PDFDocument({
        margin: 50,
        size: "A4",
        autoFirstPage: false,
        ...options,
      });
      const pdfChunks: Buffer[] = [];

      const pdfPromise = new Promise<Buffer>((resolve, reject) => {
        pdfDoc.on("data", (chunk) => pdfChunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(pdfChunks)));
        pdfDoc.on("error", reject);
      });

      // Add each file to PDF
      for (const file of files) {
        try {
          if (file.mime_type.startsWith("image/")) {
            const imageBuffer = await downloadFromS3(file.s3_key);
            pdfDoc.addPage();

            // Add image with proper sizing
            const pageWidth = pdfDoc.page.width - 100; // margins
            const pageHeight = pdfDoc.page.height - 150; // margins + space for title

            pdfDoc.fontSize(14).text(file.original_name, 50, 50);
            pdfDoc.image(imageBuffer, 50, 80, {
              fit: [pageWidth, pageHeight],
              align: "center",
            });
          } else if (file.mime_type.includes("text/")) {
            const textBuffer = await downloadFromS3(file.s3_key);
            pdfDoc.addPage();
            pdfDoc.fontSize(14).text(`File: ${file.original_name}`, 50, 50);
            pdfDoc.fontSize(10).text(textBuffer.toString(), 50, 100, {
              width: pdfDoc.page.width - 100,
            });
          }
        } catch (err) {
          console.error(
            `Failed to add file ${file.original_name} to PDF:`,
            err,
          );
        }
      }

      pdfDoc.end();
      const pdfBuffer = await pdfPromise;

      const pdfName = options.filename || `document-${Date.now()}.pdf`;
      const pdfS3Key = generateUniqueFilename(userId, pdfName);

      await client.query("BEGIN");

      // Upload PDF to S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: pdfS3Key,
          Body: pdfBuffer,
          ContentType: "application/pdf",
        }),
      );

      // Save to database with timestamps
      const userEmail = files[0].user_email;
      const newFile = await client.query(
        `INSERT INTO user_files 
       (user_id, user_email, original_name, s3_key, folder_path, size, mime_type, is_folder, created_at, updated_at)
       VALUES ($1, $2, $3, $4, '', $5, 'application/pdf', false, NOW(), NOW())
       RETURNING *`,
        [userId, userEmail, pdfName, pdfS3Key, pdfBuffer.length],
      );

      await client.query("COMMIT");

      // Generate download URL
      const downloadCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: pdfS3Key,
      });
      const downloadUrl = await getSignedUrl(s3Client, downloadCommand, {
        expiresIn: 300,
      });

      res.json({
        success: true,
        message: "PDF generated successfully",
        downloadUrl,
        fileName: pdfName,
        data: {
          file: newFile.rows[0],
        },
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Generate PDF error:", err);
      res.status(500).json({ success: false, error: "Failed to generate PDF" });
    } finally {
      client.release();
    }
  },
);

export default fileActionsRoutes;
