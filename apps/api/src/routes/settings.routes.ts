import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { SettingsService } from "../services/settings.service";
import multer from "multer";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const settingsRoutes = express.Router();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

const updateSecuritySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  clientSideEncryption: z.boolean().optional(),
  offlineModeEnabled: z.boolean().optional(),
});

const updateAppearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  fileView: z.enum(["grid", "list", "compact"]).optional(),
  thumbnailQuality: z.enum(["high", "medium", "low"]).optional(),
});

const updateLanguageSchema = z.object({
  displayLanguage: z.string().optional(),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]).optional(),
  timeFormat: z.enum(["12-hour", "24-hour"]).optional(),
  timezone: z.string().optional(),
});

const updateStorageSchema = z.object({
  autoSync: z.boolean().optional(),
  fileVersioning: z.boolean().optional(),
  maxVersionsToKeep: z.number().int().min(1).max(100).optional(),
});

const updateSharingSchema = z.object({
  defaultLinkPermission: z.enum(["view", "edit", "comment"]).optional(),
  allowPublicSharing: z.boolean().optional(),
  requirePasswordForLinks: z.boolean().optional(),
  linkExpirationDays: z.number().int().nullable().optional(),
  notifyOnShare: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
  defaultPassword: z.string().optional(),
  defaultExpirationDays: z.number().int().nullable().optional(),
  defaultDownloadLimit: z.number().int().nullable().optional(),
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  desktopNotifications: z.boolean().optional(),
  notifyOnUpload: z.boolean().optional(),
  notifyOnShare: z.boolean().optional(),
  notifyOnComment: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

const updatePrivacySchema = z.object({
  showOnlineStatus: z.boolean().optional(),
  allowActivityTracking: z.boolean().optional(),
  shareUsageData: z.boolean().optional(),
  indexFilesForSearch: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
});

settingsRoutes.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const settings = await SettingsService.getSettings(req.userId);

    res.json({
      success: true,
      settings,
    });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch settings",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

settingsRoutes.patch(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updateProfileSchema.parse(req.body);
      await SettingsService.updateProfile(req.userId, validated);

      res.json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update profile",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.patch(
  "/security",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updateSecuritySchema.parse(req.body);
      await SettingsService.updateSecurity(req.userId, validated);

      res.json({
        success: true,
        message: "Security settings updated successfully",
      });
    } catch (err) {
      console.error("Error updating security settings:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update security settings",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.patch(
  "/appearance",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updateAppearanceSchema.parse(req.body);
      await SettingsService.updateAppearance(req.userId, validated);

      res.json({
        success: true,
        message: "Appearance settings updated successfully",
      });
    } catch (err) {
      console.error("Error updating appearance:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update appearance",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.patch(
  "/language",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updateLanguageSchema.parse(req.body);
      await SettingsService.updateLanguage(req.userId, validated);

      res.json({
        success: true,
        message: "Language settings updated successfully",
      });
    } catch (err) {
      console.error("Error updating language:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update language settings",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.patch(
  "/storage",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updateStorageSchema.parse(req.body);
      await SettingsService.updateStorage(req.userId, validated);

      res.json({
        success: true,
        message: "Storage settings updated successfully",
      });
    } catch (err) {
      console.error("Error updating storage settings:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update storage settings",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.get(
  "/sharing",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }
      const sharing = await SettingsService.getSharing(req.userId);
      res.json({ success: true, sharing });
    } catch (err) {
      console.error("Error fetching sharing settings:", err);
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : "Failed to load sharing settings",
      });
    }
  },
);

settingsRoutes.patch(
  "/sharing",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updateSharingSchema.parse(req.body);
      const sharing = await SettingsService.updateSharing(req.userId, validated);

      res.json({
        success: true,
        message: "Sharing settings updated successfully",
        sharing,
      });
    } catch (err) {
      console.error("Error updating sharing settings:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update sharing settings",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.patch(
  "/preferences",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updatePreferencesSchema.parse(req.body);
      await SettingsService.updatePreferences(req.userId, validated);

      res.json({
        success: true,
        message: "Preferences updated successfully",
      });
    } catch (err) {
      console.error("Error updating preferences:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update preferences",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.patch(
  "/privacy",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updatePrivacySchema.parse(req.body);
      await SettingsService.updatePrivacy(req.userId, validated);

      res.json({
        success: true,
        message: "Privacy settings updated successfully",
      });
    } catch (err) {
      console.error("Error updating privacy settings:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update privacy settings",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Update password
settingsRoutes.patch(
  "/password",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const validated = updatePasswordSchema.parse(req.body);
      await SettingsService.updatePassword(
        req.userId,
        validated.currentPassword,
        validated.newPassword,
      );

      res.json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Error updating password:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          details: err.errors,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update password",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Upload avatar
settingsRoutes.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const avatarUrl = await SettingsService.uploadAvatar(
        req.userId,
        req.file,
      );

      res.json({
        success: true,
        avatarUrl,
        message: "Avatar uploaded successfully",
      });
    } catch (err) {
      console.error("Error uploading avatar:", err);
      res.status(500).json({
        success: false,
        error: "Failed to upload avatar",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.delete(
  "/avatar",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      await SettingsService.deleteAvatar(req.userId);

      res.json({
        success: true,
        message: "Avatar deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting avatar:", err);
      res.status(500).json({
        success: false,
        error: "Failed to delete avatar",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

settingsRoutes.get(
  "/sessions",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const sessions = await SettingsService.getActiveSessions(req.userId);

      res.json({
        success: true,
        sessions,
      });
    } catch (err) {
      console.error("Error fetching sessions:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sessions",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Sign out from specific session
settingsRoutes.delete(
  "/sessions/:sessionId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { sessionId } = req.params;
      await SettingsService.signOutSession(req.userId, sessionId);

      res.json({
        success: true,
        message: "Session signed out successfully",
      });
    } catch (err) {
      console.error("Error signing out session:", err);
      res.status(500).json({
        success: false,
        error: "Failed to sign out session",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Sign out from all sessions except current
settingsRoutes.delete(
  "/sessions/all",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      await SettingsService.signOutAllSessions(req.userId);

      res.json({
        success: true,
        message: "All sessions signed out successfully",
      });
    } catch (err) {
      console.error("Error signing out all sessions:", err);
      res.status(500).json({
        success: false,
        error: "Failed to sign out all sessions",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Get linked accounts
settingsRoutes.get(
  "/linked-accounts",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const accounts = await SettingsService.getLinkedAccounts(req.userId);

      res.json({
        success: true,
        accounts,
      });
    } catch (err) {
      console.error("Error fetching linked accounts:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch linked accounts",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Unlink account
settingsRoutes.delete(
  "/linked-accounts/:accountId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const { accountId } = req.params;
      await SettingsService.unlinkAccount(req.userId, accountId);

      res.json({
        success: true,
        message: "Account unlinked successfully",
      });
    } catch (err) {
      console.error("Error unlinking account:", err);
      res.status(500).json({
        success: false,
        error: "Failed to unlink account",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Clear cache
settingsRoutes.delete(
  "/storage/cache",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      await SettingsService.clearCache(req.userId);

      res.json({
        success: true,
        message: "Cache cleared successfully",
      });
    } catch (err) {
      console.error("Error clearing cache:", err);
      res.status(500).json({
        success: false,
        error: "Failed to clear cache",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

// Delete account
settingsRoutes.delete(
  "/account",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      await SettingsService.deleteAccount(req.userId);

      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting account:", err);
      res.status(500).json({
        success: false,
        error: "Failed to delete account",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  },
);

export default settingsRoutes;
