import express from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { uploadToS3, generateSignedUrl, generateShortId } from "../lib/helper";
import { emailService } from "../lib/email.service";
import { s3Client } from "./files.routes";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { SettingsService } from "../services/settings.service";

const sharingRoutes = express.Router();
const prisma = new PrismaClient();

function isLocalOrPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".local") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function normalizeFrontendBase(rawBase: string): string {
  try {
    const url = new URL(rawBase);
    if (url.protocol === "https:" && isLocalOrPrivateHost(url.hostname)) {
      url.protocol = "http:";
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:5173";
  }
}

function resolveFrontendBase(req: express.Request): string {
  const envBase = (process.env.FRONTEND_URL || "").trim();
  // In production, always use canonical URL from env so share links match your real host
  // (avoids *.trycloudflare.com or old tunnel URLs when Origin reflects a temporary tunnel).
  if (process.env.NODE_ENV === "production" && envBase) {
    return normalizeFrontendBase(envBase);
  }

  const origin = String(req.headers.origin || "").trim();
  if (origin) return normalizeFrontendBase(origin);

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "")
    .split(",")[0]
    .trim();
  if (forwardedProto && forwardedHost) {
    return normalizeFrontendBase(`${forwardedProto}://${forwardedHost}`);
  }

  if (envBase) return normalizeFrontendBase(envBase);

  return "http://localhost:5173";
}

const addCommentSchema = z.object({
  text: z.string().min(1).max(1000),
  userName: z.string().min(1).max(100),
});

const createShareSchema = z.object({
  fileId: z.number(),
  shareType: z.string(),
  permission: z.enum(["view", "comment", "edit", "download"]),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  expiresIn: z.number().nullable().optional(), // hours
  maxDownloads: z.number().nullable().optional(),
  recipients: z.array(z.object({
    type: z.enum(["user", "email"]),
    value: z.string(),
    permission: z.enum(["view", "comment", "edit", "download"]).optional(),
  })).optional(),
});

const updateShareSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
  maxDownloads: z.number().nullable().optional(),
});

// Resolve short id to share token (for /s/:shortId redirect; no auth)
sharingRoutes.get("/resolve-short/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const share = await prisma.fileShare.findFirst({
      where: { shortId, isActive: true },
      select: { shareToken: true, expiresAt: true },
    });
    if (!share) {
      return res.status(404).json({ success: false, error: "Share not found" });
    }
    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(404).json({ success: false, error: "Share expired" });
    }
    res.json({ success: true, shareToken: share.shareToken });
  } catch (err) {
    console.error("Resolve short error:", err);
    res.status(500).json({ success: false, error: "Failed to resolve short link" });
  }
});

// Get all shares for a specific file
sharingRoutes.get("/file/:fileId", async (req, res) => {
  try {
    const frontendUrl = resolveFrontendBase(req);
    const fileId = parseInt(req.params.fileId);

    if (isNaN(fileId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid file ID",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const shares = await prisma.fileShare.findMany({
      where: { fileId },
      include: {
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
        _count: {
          select: {
            comments: true,
            activities: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      shares: shares.map((share: (typeof shares)[number]) => ({
        id: share.id,
        shareToken: share.shareToken,
        shortId: share.shortId,
        shareType: share.shareType,
        permission: share.permission,
        hasPassword: !!share.password,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        isActive: share.isActive,
        createdAt: share.createdAt.toISOString(),
        updatedAt: share.updatedAt.toISOString(),
        ownerName: share.owner.firstName || share.owner.email,
        commentCount: share._count.comments,
        activityCount: share._count.activities,
        url: `${frontendUrl}/shared/${share.shareToken}`,
        shortUrl: share.shortId ? `${frontendUrl}/s/${share.shortId}` : null,
      })),
    });
  } catch (err) {
    console.error("Error fetching shares:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch shares",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Create a new share (auth required; apply user's default share settings when not provided)
sharingRoutes.post("/create", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const frontendUrl = resolveFrontendBase(req);
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const body = req.body || {};
    let defaults: Record<string, unknown> = {};
    try {
      const settings = await SettingsService.getSettings(req.userId);
      defaults = (settings?.sharing as Record<string, unknown>) || {};
    } catch {
      // no defaults
    }

    const merged = {
      ...body,
      permission: body.permission ?? defaults.defaultLinkPermission ?? "view",
      expiresIn: body.expiresIn ?? (typeof (defaults.defaultExpirationDays as number) === "number"
        ? (defaults.defaultExpirationDays as number) * 24
        : null),
      maxDownloads: body.maxDownloads ?? (defaults.defaultDownloadLimit as number | null) ?? null,
      password: body.password ?? ((defaults.requirePasswordForLinks && defaults.defaultPassword)
        ? String(defaults.defaultPassword)
        : undefined),
    };

    const validated = createShareSchema.parse(merged);

    const file = await prisma.userFile.findUnique({
      where: { id: validated.fileId },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    if (file.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: "You can only share your own files",
      });
    }

    if (file.deletedAt) {
      return res.status(400).json({
        success: false,
        error: "Cannot share a deleted file",
      });
    }

    const shareToken = crypto.randomBytes(32).toString("hex");
    const shortId = generateShortId();

    let hashedPassword: string | null = null;
    if (validated.password && validated.password.trim().length > 0) {
      hashedPassword = await bcrypt.hash(validated.password, 12);
    }

    let expiresAt: Date | null = null;
    if (validated.expiresAt) {
      expiresAt = new Date(validated.expiresAt);
      if (expiresAt <= new Date()) {
        return res.status(400).json({
          success: false,
          error: "Expiration date must be in the future",
        });
      }
    } else if (validated.expiresIn) {
      // expiresIn is in hours
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + validated.expiresIn);
    }

    const share = await prisma.fileShare.create({
      data: {
        fileId: validated.fileId,
        ownerId: file.userId,
        shareToken,
        shortId,
        shareType: validated.shareType,
        permission: validated.permission,
        password: hashedPassword,
        expiresAt,
        maxDownloads: validated.maxDownloads,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        userId: file.userId,
        action: "created",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: {
          permission: validated.permission,
          hasPassword: !!hashedPassword,
          expiresAt: expiresAt?.toISOString() || null,
        },
      },
    });

    // Send emails to recipients if shareType is email
    if (validated.shareType === "email" && validated.recipients && validated.recipients.length > 0) {
      const fileInfo = await prisma.userFile.findUnique({
        where: { id: validated.fileId },
        select: { originalName: true },
      });

      const owner = await prisma.user.findUnique({
        where: { id: file.userId },
        select: { firstName: true, email: true },
      });

      const shareUrl = `${frontendUrl}/shared/${share.shareToken}`;
      const emailRecipients = validated.recipients.filter(r => r.type === "email");

      // Send email to each recipient
      for (const recipient of emailRecipients) {
        try {
          await emailService.sendShareEmail(
            recipient.value,
            owner?.firstName || owner?.email || "Someone",
            fileInfo?.originalName || "a file",
            shareUrl,
            validated.permission,
            hashedPassword ? "Yes" : "No",
            expiresAt?.toLocaleDateString() || "Never",
            validated.maxDownloads?.toString() || "Unlimited"
          );
        } catch (emailError) {
          console.error(`Failed to send email to ${recipient.value}:`, emailError);
          // Continue with other recipients even if one fails
        }
      }
    }

    // Link share to platform users: if a recipient email belongs to a user, add to share_recipients
    // so the file appears in "Shared with me" and recent files for that user
    if (validated.recipients && validated.recipients.length > 0) {
      for (const r of validated.recipients) {
        const email = r.type === "email" ? r.value.trim().toLowerCase() : null;
        const userIdOrEmail = r.type === "user" ? r.value.trim() : email;
        if (!userIdOrEmail) continue;

        let recipientUser: { id: string } | null = null;
        if (r.type === "email" && email) {
          recipientUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });
        } else if (r.type === "user") {
          if (userIdOrEmail.includes("@")) {
            recipientUser = await prisma.user.findUnique({
              where: { email: userIdOrEmail.toLowerCase() },
              select: { id: true },
            });
          } else {
            recipientUser = await prisma.user.findUnique({
              where: { id: userIdOrEmail },
              select: { id: true },
            });
          }
        }

        if (recipientUser && recipientUser.id !== file.userId) {
          try {
            await prisma.$executeRawUnsafe(
              `INSERT INTO share_recipients (id, share_id, recipient_user_id)
               VALUES ($1, $2, $3)
               ON CONFLICT (share_id, recipient_user_id) DO NOTHING`,
              crypto.randomUUID(),
              share.id,
              recipientUser.id,
            );
          } catch (e) {
            console.error("Failed to link share to recipient:", e);
          }
        }
      }
    }

    const fullUrl = `${frontendUrl}/shared/${share.shareToken}`;
    const shortUrl = share.shortId ? `${frontendUrl}/s/${share.shortId}` : null;

    res.status(201).json({
      success: true,
      share: {
        id: share.id,
        shareToken: share.shareToken,
        shortId: share.shortId,
        shareType: share.shareType,
        permission: share.permission,
        hasPassword: !!share.password,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        isActive: share.isActive,
        createdAt: share.createdAt.toISOString(),
        url: fullUrl,
        shortUrl,
      },
    });
  } catch (err) {
    console.error("Error creating share:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create share",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Update a share
sharingRoutes.put("/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;
    const validated = updateShareSchema.parse(req.body);

    const existingShare = await prisma.fileShare.findUnique({
      where: { id: shareId },
    });

    if (!existingShare) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    const updateData: any = {};

    if (validated.isActive !== undefined) {
      updateData.isActive = validated.isActive;
    }

    if (validated.expiresAt !== undefined) {
      if (validated.expiresAt === null) {
        updateData.expiresAt = null;
      } else {
        const newExpiresAt = new Date(validated.expiresAt);
        if (newExpiresAt <= new Date()) {
          return res.status(400).json({
            success: false,
            error: "Expiration date must be in the future",
          });
        }
        updateData.expiresAt = newExpiresAt;
      }
    }

    if (validated.maxDownloads !== undefined) {
      updateData.maxDownloads = validated.maxDownloads;
    }

    const share = await prisma.fileShare.update({
      where: { id: shareId },
      data: updateData,
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        userId: existingShare.ownerId,
        action: "updated",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: updateData,
      },
    });

    res.json({
      success: true,
      share: {
        id: share.id,
        shareToken: share.shareToken,
        isActive: share.isActive,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        updatedAt: share.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error updating share:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update share",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Delete a share
sharingRoutes.delete("/:shareId", async (req, res) => {
  try {
    const { shareId } = req.params;

    const existingShare = await prisma.fileShare.findUnique({
      where: { id: shareId },
    });

    if (!existingShare) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    await prisma.fileShare.delete({
      where: { id: shareId },
    });

    res.json({
      success: true,
      message: "Share deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting share:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete share",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get public share info (no auth required)
sharingRoutes.get("/public/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
      include: {
        owner: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "Maximum download limit reached",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    res.json({
      success: true,
      share: {
        id: share.id,
        fileName: file.originalName,
        fileSize: Number(file.size),
        mimeType: file.mimeType,
        permission: share.permission,
        ownerName: share.owner.firstName || share.owner.email,
        hasPassword: !!share.password,
        expiresAt: share.expiresAt?.toISOString() || null,
        maxDownloads: share.maxDownloads,
        downloadCount: share.downloadCount,
        is_locked: file.isLocked,
      },
    });
  } catch (err) {
    console.error("Error fetching share info:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch share info",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Access a shared file (verify password if needed)
sharingRoutes.post("/access/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { isActive: false },
      });
      return res.status(403).json({
        success: false,
        error: "Maximum download limit reached",
      });
    }

    if (share.password) {
      if (!password) {
        return res.status(401).json({
          success: false,
          error: "Password required",
        });
      }

      const isValid = await bcrypt.compare(password, share.password);
      if (!isValid) {
        await prisma.shareActivity.create({
          data: {
            shareId: share.id,
            action: "failed_password",
            ipAddress: req.ip || "unknown",
            userAgent: req.headers["user-agent"] || "unknown",
          },
        });
        return res.status(401).json({
          success: false,
          error: "Invalid password",
        });
      }
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const signedUrl = await generateSignedUrl(file.s3Key, 3600);

    if (share.permission === "download") {
      await prisma.fileShare.update({
        where: { id: share.id },
        data: { downloadCount: share.downloadCount + 1 },
      });
    }

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        action: "accessed",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
      },
    });

    res.json({
      success: true,
      signedUrl,
    });
  } catch (err) {
    console.error("Error accessing file:", err);
    res.status(500).json({
      success: false,
      error: "Failed to access file",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get shared file content (proxy for text files - avoids CORS when loading from signed URL)
sharingRoutes.get("/content/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const mimeType = file.mimeType.toLowerCase();
    const isTextFile =
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript" ||
      mimeType === "application/typescript" ||
      mimeType === "application/x-yaml" ||
      mimeType === "application/sql" ||
      mimeType === "application/x-sh" ||
      mimeType === "application/x-bat" ||
      mimeType === "application/x-powershell" ||
      mimeType === "application/x-httpd-php" ||
      mimeType === "application/x-ruby" ||
      ["txt", "md", "json", "xml", "csv", "tsv", "log", "js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "h", "css", "scss", "html", "sql", "yaml", "yml", "sh", "bat", "ps1", "php", "rb", "go", "rs", "cs", "ini", "conf", "env", "lock"].some(
        (ext) => file.originalName?.toLowerCase().endsWith(`.${ext}`)
      );

    if (!isTextFile) {
      return res.status(400).json({
        success: false,
        error: "Content endpoint is for text files only",
      });
    }

    const bucketName = process.env.B2_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.s3Key,
    });
    const response = await s3Client.send(command);
    const body = response.Body;
    if (!body) {
      return res.status(404).json({
        success: false,
        error: "File content not found",
      });
    }
    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString("utf-8");

    res.json({
      success: true,
      content,
    });
  } catch (err) {
    console.error("Error fetching shared file content:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load file content",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Stream shared file for preview (images, video, audio, PDF) - avoids CORS with signed URLs
sharingRoutes.get("/stream/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const bucketName = process.env.B2_BUCKET_NAME;
    if (!bucketName) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error",
      });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: file.s3Key,
    });
    const response = await s3Client.send(command);
    const body = response.Body;
    if (!body) {
      return res.status(404).json({
        success: false,
        error: "File content not found",
      });
    }

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    // Allow cross-origin use so img/video/audio/iframe can load when frontend is on different origin
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // Allow embedding in iframe from frontend (different origin)
    res.removeHeader("X-Frame-Options");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");

    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    res.send(Buffer.concat(chunks));
  } catch (err) {
    console.error("Error streaming shared file:", err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to stream file",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
});

// Get comments for a shared file
sharingRoutes.get("/comments/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!["comment", "edit"].includes(share.permission)) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to view comments",
      });
    }

    const comments = await prisma.shareComment.findMany({
      where: { shareId: share.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userName: true,
        text: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      comments: comments.map((c: { id: string; userName: string; text: string; createdAt: Date }) => ({
        id: c.id,
        userName: c.userName,
        text: c.text,
        timestamp: c.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch comments",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Add a comment to a shared file
sharingRoutes.post("/comments/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const validated = addCommentSchema.parse(req.body);

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    if (!["comment", "edit"].includes(share.permission)) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to comment",
      });
    }

    const comment = await prisma.shareComment.create({
      data: {
        shareId: share.id,
        userName: validated.userName,
        text: validated.text,
      },
      select: {
        id: true,
        userName: true,
        text: true,
        createdAt: true,
      },
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        action: "commented",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: {
          commentId: comment.id,
          userName: validated.userName,
        },
      },
    });

    res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        userName: comment.userName,
        text: comment.text,
        timestamp: comment.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: err.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to add comment",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Edit shared file content (for text files with edit permission)
sharingRoutes.post("/edit/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { content } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        error: "Content must be a string",
      });
    }

    const share = await prisma.fileShare.findUnique({
      where: { shareToken: token },
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: "Share not found",
      });
    }

    if (share.permission !== "edit") {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to edit",
      });
    }

    if (!share.isActive) {
      return res.status(403).json({
        success: false,
        error: "This share is no longer active",
      });
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(403).json({
        success: false,
        error: "This share has expired",
      });
    }

    const file = await prisma.userFile.findUnique({
      where: { id: share.fileId },
    });

    if (!file || file.deletedAt) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const mimeType = file.mimeType.toLowerCase();
    const isTextFile =
      mimeType.startsWith("text/") ||
      mimeType === "application/json" ||
      mimeType === "application/xml" ||
      mimeType === "application/javascript";

    if (!isTextFile) {
      return res.status(400).json({
        success: false,
        error: "Only text files can be edited",
      });
    }

    await uploadToS3(file.s3Key, content, file.mimeType);

    const newSize = Buffer.byteLength(content, "utf-8");
    await prisma.userFile.update({
      where: { id: file.id },
      data: {
        size: BigInt(newSize),
        updatedAt: new Date(),
      },
    });

    await prisma.shareActivity.create({
      data: {
        shareId: share.id,
        action: "edited",
        ipAddress: req.ip || "unknown",
        userAgent: req.headers["user-agent"] || "unknown",
        metadata: {
          previousSize: Number(file.size),
          newSize,
        },
      },
    });

    res.json({
      success: true,
      message: "File updated successfully",
      fileSize: newSize,
    });
  } catch (err) {
    console.error("Error editing file:", err);
    res.status(500).json({
      success: false,
      error: "Failed to edit file",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default sharingRoutes;
