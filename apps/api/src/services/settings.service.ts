import { Pool } from "pg";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

import { StorageService } from "./storage.service";

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const s3Client = new S3Client({
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
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");

export class SettingsService {
  static async initializeSettings(userId: string, email: string) {
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, profile, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
      [
        userId,
        JSON.stringify({ email, firstName: "", lastName: "", avatarUrl: null }),
      ],
    );
    return result.rows[0];
  }

  static async getSettings(userId: string) {
    await this.ensureSettingsExist(userId);

    const result = await pool.query(
      `SELECT * FROM user_settings WHERE user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new Error("Settings not found");
    }

    const settings = result.rows[0];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    const usageResult = await pool.query(
      `SELECT COALESCE(SUM(size), 0) as used_storage
       FROM user_files
       WHERE user_id = $1`,
      [userId],
    );

    const profile = settings.profile || {};
    const firstName = user?.firstName || profile.firstName || "";
    const lastName = profile.lastName || "";

    const storageInfo = await StorageService.getStorageInfo(userId);

    const totalStorage = parseInt(storageInfo.limit, 10);
    const usedStorage = parseInt(storageInfo.used, 10);

    return {
      profile: {
        email: user?.email || profile.email || "",
        firstName: firstName,
        lastName: lastName,
        avatarUrl: profile.avatarUrl || null,
        avatarInitials: this.getInitials(firstName, lastName),
      },
      security: settings.security || {},
      appearance: settings.appearance || {},
      language: settings.language || {},
      storage: {
        ...(settings.storage || {}),
        totalStorage,
        usedStorage,
        autoSync: settings.storage?.autoSync ?? true,
        fileVersioning: settings.storage?.fileVersioning ?? true,
        maxVersionsToKeep: settings.storage?.maxVersionsToKeep ?? 10,
        cacheSize: 0, // Calculate if needed
      },
      sharing: settings.sharing || {},
      preferences: settings.preferences || {},
      privacy: settings.privacy || {},
      createdAt: settings.created_at,
      updatedAt: settings.updated_at,
    };
  }

  static async updateProfile(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    if (data.email) {
      await prisma.user.update({
        where: { id: userId },
        data: { email: data.email },
      });
    }

    if (data.firstName) {
      await prisma.user.update({
        where: { id: userId },
        data: { firstName: data.firstName },
      });
    }

    await pool.query(
      `UPDATE user_settings
       SET profile = profile || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async updateSecurity(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    await pool.query(
      `UPDATE user_settings
       SET security = security || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async updateAppearance(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    await pool.query(
      `UPDATE user_settings
       SET appearance = appearance || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async updateLanguage(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    await pool.query(
      `UPDATE user_settings
       SET language = language || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async updateStorage(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    await pool.query(
      `UPDATE user_settings
       SET storage = storage || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async getSharing(userId: string): Promise<Record<string, unknown>> {
    await this.ensureSettingsExist(userId);
    const result = await pool.query(
      `SELECT sharing FROM user_settings WHERE user_id = $1`,
      [userId],
    );
    const raw = result.rows[0]?.sharing;
    if (raw == null) return {};
    if (typeof raw === "string") return JSON.parse(raw || "{}") as Record<string, unknown>;
    return (raw as Record<string, unknown>) || {};
  }

  static async updateSharing(userId: string, data: any): Promise<Record<string, unknown>> {
    await this.ensureSettingsExist(userId);

    const current = await pool.query(
      `SELECT sharing FROM user_settings WHERE user_id = $1`,
      [userId],
    );
    const raw = current.rows[0]?.sharing;
    const existing: Record<string, unknown> =
      raw == null
        ? {}
        : typeof raw === "string"
          ? (JSON.parse(raw || "{}") as Record<string, unknown>)
          : (raw as Record<string, unknown>);

    const merged = { ...existing, ...data };
    await pool.query(
      `UPDATE user_settings
       SET sharing = $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(merged), userId],
    );
    return merged;
  }

  static async updatePreferences(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    await pool.query(
      `UPDATE user_settings
       SET preferences = preferences || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async updatePrivacy(userId: string, data: any) {
    await this.ensureSettingsExist(userId);

    await pool.query(
      `UPDATE user_settings
       SET privacy = privacy || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify(data), userId],
    );
  }

  static async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await pool.query(
      `UPDATE user_settings
       SET security = security || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify({ passwordLastChanged: new Date() }), userId],
    );
  }

  static async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let body: Buffer;
    try {
      body = await sharp(file.buffer)
        .resize(256, 256, { fit: "cover" })
        .jpeg({ quality: 85 })
        .toBuffer();
    } catch {
      body = file.buffer;
    }

    // Only use B2 when we have a public URL; otherwise avatars are stored as base64 in DB (free, always works)
    const useB2 =
      BUCKET_NAME &&
      process.env.B2_KEY_ID &&
      process.env.B2_APPLICATION_KEY &&
      process.env.B2_PUBLIC_URL;

    let avatarUrl: string;

    if (useB2) {
      const timestamp = Date.now();
      const s3Key = `avatars/${user.email}/${timestamp}.jpg`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: body,
          ContentType: "image/jpeg",
          Metadata: {
            userId,
            uploadDate: new Date().toISOString(),
          },
        }),
      );
      avatarUrl = `${process.env.B2_PUBLIC_URL}/${s3Key}`;
    } else {
      // Free fallback: store resized image as base64 in DB (no B2/S3 needed)
      avatarUrl = `data:image/jpeg;base64,${body.toString("base64")}`;
    }

    await pool.query(
      `UPDATE user_settings
       SET profile = profile || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify({ avatarUrl }), userId],
    );

    return avatarUrl;
  }

  static async deleteAvatar(userId: string) {
    const result = await pool.query(
      `SELECT profile FROM user_settings WHERE user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new Error("Settings not found");
    }

    const profile = result.rows[0].profile;
    const avatarUrl = profile?.avatarUrl;

    if (avatarUrl && !avatarUrl.startsWith("data:")) {
      const publicBase =
        process.env.B2_PUBLIC_URL ||
        (process.env.B2_ENDPOINT && BUCKET_NAME
          ? `${process.env.B2_ENDPOINT}/${BUCKET_NAME}`
          : "");
      const s3Key =
        publicBase && avatarUrl.startsWith(publicBase)
          ? avatarUrl.replace(`${publicBase}/`, "")
          : avatarUrl;

      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
          }),
        );
      } catch (err) {
        console.error("Error deleting avatar from S3:", err);
      }
    }

    await pool.query(
      `UPDATE user_settings
       SET profile = profile || $1::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [JSON.stringify({ avatarUrl: null }), userId],
    );
  }

  static async getActiveSessions(userId: string) {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sessions.map((session: (typeof sessions)[number]) => ({
      id: session.id,
      deviceType: "web" as const,
      deviceName: "Web Browser",
      lastActive: session.createdAt,
      isCurrent: false, // TODO: Determine current session
    }));
  }

  static async signOutSession(userId: string, sessionId: string) {
    await prisma.session.delete({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  static async signOutAllSessions(userId: string) {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  static async getLinkedAccounts(userId: string) {
    const result = await pool.query(
      `SELECT id, provider, email, linked_at, is_active
       FROM linked_accounts
       WHERE user_id = $1
       ORDER BY linked_at DESC`,
      [userId],
    );

    return result.rows.map((row) => ({
      id: row.id.toString(),
      provider: row.provider,
      email: row.email,
      linkedAt: row.linked_at,
      isActive: row.is_active,
    }));
  }

  static async unlinkAccount(userId: string, accountId: string) {
    await pool.query(
      `DELETE FROM linked_accounts
       WHERE id = $1 AND user_id = $2`,
      [accountId, userId],
    );
  }

  static async clearCache(userId: string) {
    // TODO: Implement cache clearing logic
    console.log(`Clearing cache for user ${userId}`);
  }

  static async deleteAccount(userId: string) {
    // Delete all user files from S3
    const files = await prisma.userFile.findMany({
      where: { userId },
      select: { s3Key: true },
    });

    for (const file of files) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: file.s3Key,
          }),
        );
      } catch (err) {
        console.error(`Error deleting file ${file.s3Key} from S3:`, err);
      }
    }

    // Delete user settings
    await pool.query(`DELETE FROM user_settings WHERE user_id = $1`, [userId]);

    // Delete social accounts (using Prisma since table exists there)
    await prisma.socialAccount.deleteMany({
      where: { userId },
    });

    // Delete all user files (cascade will handle related records)
    await prisma.userFile.deleteMany({
      where: { userId },
    });

    // Delete all file shares
    await prisma.fileShare.deleteMany({
      where: { ownerId: userId },
    });

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    await prisma.totpRecoveryCode.deleteMany({
      where: { userId },
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  private static async ensureSettingsExist(userId: string) {
    const result = await pool.query(
      `SELECT id FROM user_settings WHERE user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      await this.initializeSettings(userId, user?.email || "");
    }
  }

  private static getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return `${first}${last}` || "??";
  }
}
