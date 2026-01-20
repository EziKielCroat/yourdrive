import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { Pool } from "pg";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { s3Client } from "./files.routes";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const sharingRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function generateShareToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

sharingRoutes.get("/", authMiddleware, async (req: AuthRequest, res) => {
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
        fs.has_password,
        fs.expires_at,
        uf.original_name,
        uf.size,
        uf.mime_type,
        u.name AS owner_name,
        u.email AS owner_email,
        sr.recipient_type
      FROM share_recipients sr
      JOIN file_shares fs ON fs.id = sr.share_id
      JOIN user_files uf ON uf.id = fs.file_id
      JOIN "User" u ON u.id = fs.owner_id
      WHERE sr.recipient_user_id = $1
        AND fs.is_active = true
      ORDER BY fs.created_at DESC
      `,
      [userId],
    );

    res.json({ success: true, sharedFiles: sharedResult.rows });
  } catch (err) {
    console.error("Error fetching shared files:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch shared files" });
  }
});

sharingRoutes.post("/create", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const {
      fileId,
      shareType = "link",
      permission = "view",
      password,
      expiresIn, // in hours
      maxDownloads,
      recipients = [],
    } = req.body;

    // Verify file ownership
    const fileResult = await pool.query(
      `SELECT id, original_name, user_id FROM user_files WHERE id = $1`,
      [fileId],
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const file = fileResult.rows[0];

    if (file.user_id !== req.userId) {
      return res.status(403).json({ success: false, error: "Not authorized" });
    }

    const shareToken = generateShareToken();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 60 * 60 * 1000)
      : null;

    // Create share
    const shareResult = await pool.query(
      `INSERT INTO file_shares 
        (file_id, owner_id, share_token, share_type, permission, password, expires_at, max_downloads)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        fileId,
        req.userId,
        shareToken,
        shareType,
        permission,
        hashedPassword,
        expiresAt,
        maxDownloads,
      ],
    );

    const share = shareResult.rows[0];

    // Add recipients if provided
    if (recipients.length > 0) {
      const recipientPromises = recipients.map(async (recipient: any) => {
        const recipientPermission = recipient.permission || permission;

        if (recipient.type === "user") {
          // Look up user by email or ID
          const userResult = await pool.query(
            `SELECT id FROM "User" WHERE email = $1 OR id = $1`,
            [recipient.value],
          );

          if (userResult.rows.length > 0) {
            await pool.query(
              `INSERT INTO share_recipients 
                (share_id, recipient_type, recipient_user_id, permission)
               VALUES ($1, 'user', $2, $3)`,
              [share.id, userResult.rows[0].id, recipientPermission],
            );
          }
        } else if (recipient.type === "email") {
          await pool.query(
            `INSERT INTO share_recipients 
              (share_id, recipient_type, recipient_email, permission)
             VALUES ($1, 'email', $2, $3)`,
            [share.id, recipient.value, recipientPermission],
          );
        }
      });

      await Promise.all(recipientPromises);
    } else {
      // Anyone with link
      await pool.query(
        `INSERT INTO share_recipients 
          (share_id, recipient_type, permission)
         VALUES ($1, 'anyone', $2)`,
        [share.id, permission],
      );
    }

    // Log activity
    await pool.query(
      `INSERT INTO share_activity (share_id, user_id, action, metadata)
       VALUES ($1, $2, 'created', $3)`,
      [share.id, req.userId, JSON.stringify({ fileName: file.original_name })],
    );

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareToken}`;

    res.json({
      success: true,
      share: {
        id: share.id,
        token: shareToken,
        url: shareUrl,
        permission: share.permission,
        expiresAt: share.expires_at,
        hasPassword: !!password,
      },
    });
  } catch (err) {
    console.error("Error creating share:", err);
    res.status(500).json({ success: false, error: "Failed to create share" });
  }
});

// Get share details (public endpoint)
sharingRoutes.get("/public/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const shareResult = await pool.query(
      `SELECT 
        fs.*,
        uf.original_name,
        uf.size,
        uf.mime_type,
        u.name as owner_name,
        u.email as owner_email
       FROM file_shares fs
       JOIN user_files uf ON fs.file_id = uf.id
       JOIN "User" u ON fs.owner_id = u.id
       WHERE fs.share_token = $1 AND fs.is_active = true`,
      [token],
    );

    if (shareResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Share not found or expired" });
    }

    const share = shareResult.rows[0];

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      await pool.query(
        `UPDATE file_shares SET is_active = false WHERE id = $1`,
        [share.id],
      );
      return res
        .status(410)
        .json({ success: false, error: "This share has expired" });
    }

    // Check download limit
    if (share.max_downloads && share.download_count >= share.max_downloads) {
      return res
        .status(403)
        .json({ success: false, error: "Download limit reached" });
    }

    res.json({
      success: true,
      share: {
        id: share.id,
        fileName: share.original_name,
        fileSize: share.size,
        mimeType: share.mime_type,
        permission: share.permission,
        ownerName: share.owner_name,
        hasPassword: !!share.password,
        expiresAt: share.expires_at,
        maxDownloads: share.max_downloads,
        downloadCount: share.download_count,
      },
    });
  } catch (err) {
    console.error("Error fetching share:", err);
    res.status(500).json({ success: false, error: "Failed to fetch share" });
  }
});

// Access shared file (with password if needed)
sharingRoutes.post("/access/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const shareResult = await pool.query(
      `SELECT fs.*, uf.s3_key, uf.original_name
       FROM file_shares fs
       JOIN user_files uf ON fs.file_id = uf.id
       WHERE fs.share_token = $1 AND fs.is_active = true`,
      [token],
    );

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Share not found" });
    }

    const share = shareResult.rows[0];

    // Check if expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      await pool.query(
        `UPDATE file_shares SET is_active = false WHERE id = $1`,
        [share.id],
      );
      return res
        .status(410)
        .json({ success: false, error: "This share has expired" });
    }

    // Verify password if required
    if (share.password) {
      if (!password) {
        return res
          .status(401)
          .json({ success: false, error: "Password required" });
      }

      const isValid = await bcrypt.compare(password, share.password);
      if (!isValid) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid password" });
      }
    }

    // Generate signed URL for Backblaze B2
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: share.s3_key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Log access
    await pool.query(
      `INSERT INTO share_activity (share_id, action, ip_address)
       VALUES ($1, 'accessed', $2)`,
      [share.id, req.ip],
    );

    res.json({
      success: true,
      fileId: share.file_id,
      permission: share.permission,
      signedUrl: signedUrl,
      fileName: share.original_name,
    });
  } catch (err) {
    console.error("Error accessing share:", err);
    res.status(500).json({ success: false, error: "Failed to access share" });
  }
});

// Get all shares for a file
sharingRoutes.get(
  "/file/:fileId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res
          .status(401)
          .json({ success: false, error: "Authentication required" });
      }

      const { fileId } = req.params;

      // Verify ownership
      const fileResult = await pool.query(
        `SELECT user_id FROM user_files WHERE id = $1`,
        [fileId],
      );

      if (fileResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "File not found" });
      }

      if (fileResult.rows[0].user_id !== req.userId) {
        return res
          .status(403)
          .json({ success: false, error: "Not authorized" });
      }

      const sharesResult = await pool.query(
        `SELECT 
        fs.*,
        COUNT(sr.id) as recipient_count,
        COUNT(sa.id) FILTER (WHERE sa.action = 'accessed') as access_count
       FROM file_shares fs
       LEFT JOIN share_recipients sr ON fs.id = sr.share_id
       LEFT JOIN share_activity sa ON fs.id = sa.share_id
       WHERE fs.file_id = $1 AND fs.is_active = true
       GROUP BY fs.id
       ORDER BY fs.created_at DESC`,
        [fileId],
      );

      const shares = sharesResult.rows.map((share) => ({
        id: share.id,
        token: share.share_token,
        url: `${process.env.FRONTEND_URL}/shared/${share.share_token}`,
        permission: share.permission,
        shareType: share.share_type,
        hasPassword: !!share.password,
        expiresAt: share.expires_at,
        maxDownloads: share.max_downloads,
        downloadCount: share.download_count,
        recipientCount: parseInt(share.recipient_count),
        accessCount: parseInt(share.access_count),
        createdAt: share.created_at,
      }));

      res.json({ success: true, shares });
    } catch (err) {
      console.error("Error fetching shares:", err);
      res.status(500).json({ success: false, error: "Failed to fetch shares" });
    }
  },
);

// Revoke/delete a share
sharingRoutes.delete(
  "/:shareId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res
          .status(401)
          .json({ success: false, error: "Authentication required" });
      }

      const { shareId } = req.params;

      // Verify ownership
      const shareResult = await pool.query(
        `SELECT owner_id FROM file_shares WHERE id = $1`,
        [shareId],
      );

      if (shareResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (shareResult.rows[0].owner_id !== req.userId) {
        return res
          .status(403)
          .json({ success: false, error: "Not authorized" });
      }

      await pool.query(
        `UPDATE file_shares SET is_active = false, updated_at = NOW() WHERE id = $1`,
        [shareId],
      );

      await pool.query(
        `INSERT INTO share_activity (share_id, user_id, action)
       VALUES ($1, $2, 'revoked')`,
        [shareId, req.userId],
      );

      res.json({ success: true, message: "Share revoked successfully" });
    } catch (err) {
      console.error("Error revoking share:", err);
      res.status(500).json({ success: false, error: "Failed to revoke share" });
    }
  },
);

// Update share settings
sharingRoutes.patch(
  "/:shareId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res
          .status(401)
          .json({ success: false, error: "Authentication required" });
      }

      const { shareId } = req.params;
      const { permission, expiresIn, maxDownloads, password } = req.body;

      // Verify ownership
      const shareResult = await pool.query(
        `SELECT owner_id FROM file_shares WHERE id = $1`,
        [shareId],
      );

      if (shareResult.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Share not found" });
      }

      if (shareResult.rows[0].owner_id !== req.userId) {
        return res
          .status(403)
          .json({ success: false, error: "Not authorized" });
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (permission) {
        updates.push(`permission = $${paramCount++}`);
        values.push(permission);
      }

      if (expiresIn !== undefined) {
        const expiresAt = expiresIn
          ? new Date(Date.now() + expiresIn * 60 * 60 * 1000)
          : null;
        updates.push(`expires_at = $${paramCount++}`);
        values.push(expiresAt);
      }

      if (maxDownloads !== undefined) {
        updates.push(`max_downloads = $${paramCount++}`);
        values.push(maxDownloads);
      }

      if (password !== undefined) {
        const hashedPassword = password
          ? await bcrypt.hash(password, 10)
          : null;
        updates.push(`password = $${paramCount++}`);
        values.push(hashedPassword);
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(shareId);

        await pool.query(
          `UPDATE file_shares SET ${updates.join(", ")} WHERE id = $${paramCount}`,
          values,
        );
      }

      res.json({ success: true, message: "Share updated successfully" });
    } catch (err) {
      console.error("Error updating share:", err);
      res.status(500).json({ success: false, error: "Failed to update share" });
    }
  },
);

sharingRoutes.get(
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
        u.name AS owner_name,
        u.email AS owner_email
      FROM share_recipients sr
      JOIN file_shares fs ON fs.id = sr.share_id
      JOIN user_files uf ON uf.id = fs.file_id
      JOIN "User" u ON u.id = fs.owner_id
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
      }));

      res.json({ success: true, sharedFiles });
    } catch (err) {
      console.error("Error fetching shared-with-me files:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch shared files" });
    }
  },
);

export default sharingRoutes;
