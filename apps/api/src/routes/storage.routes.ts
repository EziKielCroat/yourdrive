import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { StorageService } from "../services/storage.service";

const storageRoutes = express.Router();

// Get storage info
storageRoutes.get("/info", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const storageInfo = await StorageService.getStorageInfo(req.userId);

    res.json({
      success: true,
      ...storageInfo,
    });
  } catch (error) {
    console.error("Error fetching storage info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch storage info",
    });
  }
});

// Get storage statistics
storageRoutes.get("/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const stats = await StorageService.getStorageStats(req.userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching storage stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch storage stats",
    });
  }
});

// Clear cache
storageRoutes.post("/clear-cache", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    await StorageService.clearCache(req.userId);
    
    res.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear cache",
    });
  }
});

// Remove duplicates
storageRoutes.post("/remove-duplicates", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const removedCount = await StorageService.removeDuplicates(req.userId);
    
    res.json({
      success: true,
      message: "Duplicate files removed successfully",
      removedCount,
    });
  } catch (error) {
    console.error("Error removing duplicates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove duplicates",
    });
  }
});

export default storageRoutes;