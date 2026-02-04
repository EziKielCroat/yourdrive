import express from "express";
import { Pool } from "pg";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const favoritesRoutes = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

favoritesRoutes.post(
  "/:fileId/favorite",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;
      const fileId = req.params.fileId;

      if (!userId)
        return res.status(401).json({ success: false, error: "Unauthorized" });

      const exists = await pool.query(
        `SELECT id FROM favorited_files WHERE user_id=$1 AND file_id=$2`,
        [userId, fileId],
      );

      if (exists.rowCount > 0) {
        await pool.query(
          `DELETE FROM favorited_files WHERE user_id=$1 AND file_id=$2`,
          [userId, fileId],
        );
        return res.json({
          success: true,
          favorited: false,
          message: "Removed from favorites",
        });
      }

      await pool.query(
        `INSERT INTO favorited_files (user_id, file_id, created_at) VALUES ($1, $2, NOW())`,
        [userId, fileId],
      );

      return res.json({
        success: true,
        favorited: true,
        message: "Added to favorites",
      });
    } catch (err) {
      console.error("Favorite toggle error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  },
);

favoritesRoutes.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT uf.*, uf.created_at AS favorited_at
       FROM favorited_files ff
       JOIN user_files uf ON uf.id = ff.file_id
       WHERE ff.user_id = $1
       ORDER BY uf.created_at DESC`,
      [userId],
    );

    return res.json({ success: true, files: result.rows });
  } catch (err) {
    console.error("Load favorites error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load favorites" });
  }
});

favoritesRoutes.get(
  "/check-favorites",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId;

      const result = await pool.query(
        `SELECT file_id FROM favorited_files WHERE user_id = $1`,
        [userId],
      );

      const ids = result.rows.map((r) => r.file_id);
      return res.json({ success: true, favorites: ids });
    } catch (err) {
      console.error("Check favorites error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to determine favorites" });
    }
  },
);

export default favoritesRoutes;
