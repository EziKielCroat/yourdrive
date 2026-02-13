import express from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { Pool } from "pg";
import { logDeviceAction } from "../lib/helper";

const devicesRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

devicesRoutes.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Get global storage stats for the user (exclude trashed files)
    const storageStats = await pool.query(
      `
      SELECT 
        COALESCE(SUM(uf.size), 0)::bigint as total_storage,
        COUNT(uf.id)::bigint as total_files
      FROM user_files uf
      WHERE uf.user_id = $1 AND uf.deleted_at IS NULL AND uf.original_name != '.metadata'
      `,
      [req.userId],
    );

    const globalStorage = Number(storageStats.rows[0]?.total_storage || 0);
    const globalFileCount = Number(storageStats.rows[0]?.total_files || 0);

    // Get current device ID from cookie
    const currentDeviceId = req.cookies.deviceId;

    const devices = await pool.query(
      `
      SELECT 
        d.*,
        COALESCE(d.device_nickname, d.device_name) AS display_name,
        CASE 
          WHEN d.id = $2 THEN $3::bigint
          ELSE NULL
        END as file_count,
        CASE 
          WHEN d.id = $2 THEN $4::bigint
          ELSE NULL
        END as total_storage
      FROM user_devices d
      WHERE d.user_id = $1
        AND d.device_name <> 'Primary Device'
      ORDER BY d.last_active DESC
      `,
      [req.userId, currentDeviceId || null, globalFileCount, globalStorage],
    );

    res.json({
      success: true,
      devices: devices.rows,
    });
  } catch (err) {
    console.error("Error fetching devices:", err);
    res.status(500).json({ success: false, error: "Failed to fetch devices" });
  }
});

// ==================== DEVICE GROUPS ====================

// Get all groups for user
devicesRoutes.get("/groups", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Check if device_groups table exists
    const tableExists = await pool.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'device_groups'
      );
      `,
    );

    if (!tableExists.rows[0]?.exists) {
      // Table doesn't exist, return empty array
      return res.json({
        success: true,
        groups: [],
      });
    }

    const groups = await pool.query(
      `
      SELECT 
        g.*,
        COUNT(dgm.device_id) as device_count,
        ARRAY_AGG(
          json_build_object(
            'device_id', d.id,
            'device_name', COALESCE(d.device_nickname, d.device_name),
            'device_type', d.device_type,
            'is_current', d.is_current
          )
        ) FILTER (WHERE d.id IS NOT NULL) as devices
      FROM device_groups g
      LEFT JOIN device_group_members dgm ON dgm.group_id = g.id
      LEFT JOIN user_devices d ON d.id = dgm.device_id
      WHERE g.user_id = $1
      GROUP BY g.id
      ORDER BY g.created_at DESC
      `,
      [req.userId],
    );

    res.json({
      success: true,
      groups: groups.rows,
    });
  } catch (err) {
    console.error("Error fetching groups:", err);
    // Return empty array on error instead of failing
    res.json({
      success: true,
      groups: [],
    });
  }
});

// Create device group
devicesRoutes.post("/groups", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { name, description, icon, color } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "Group name is required" });
    }

    // Check if device_groups table exists
    const tableExists = await pool.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'device_groups'
      );
      `,
    );

    if (!tableExists.rows[0]?.exists) {
      return res.status(501).json({
        success: false,
        error: "Device groups feature is not available",
      });
    }

    const result = await pool.query(
      `INSERT INTO device_groups (user_id, name, description, icon, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userId, name, description || null, icon || "📱", color || "#1a73e8"],
    );

    res.json({
      success: true,
      group: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ success: false, error: "Failed to create group" });
  }
});

// Update device group
devicesRoutes.patch(
  "/groups/:groupId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Check if device_groups table exists
      const tableExists = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'device_groups'
        );
        `,
      );

      if (!tableExists.rows[0]?.exists) {
        return res.status(501).json({
          success: false,
          error: "Device groups feature is not available",
        });
      }

      const { groupId } = req.params;
      const { name, description, icon, color } = req.body;

      const result = await pool.query(
        `UPDATE device_groups 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           icon = COALESCE($3, icon),
           color = COALESCE($4, color)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
        [name, description, icon, color, groupId, req.userId],
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Group not found" });
      }

      res.json({
        success: true,
        group: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating group:", err);
      res.status(500).json({ success: false, error: "Failed to update group" });
    }
  },
);

// Delete device group
devicesRoutes.delete(
  "/groups/:groupId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Check if device_groups table exists
      const tableExists = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'device_groups'
        );
        `,
      );

      if (!tableExists.rows[0]?.exists) {
        return res.status(501).json({
          success: false,
          error: "Device groups feature is not available",
        });
      }

      const { groupId } = req.params;

      const result = await pool.query(
        `DELETE FROM device_groups WHERE id = $1 AND user_id = $2 RETURNING *`,
        [groupId, req.userId],
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Group not found" });
      }

      res.json({
        success: true,
        message: "Group deleted successfully",
      });
    } catch (err) {
      console.error("Error deleting group:", err);
      res.status(500).json({ success: false, error: "Failed to delete group" });
    }
  },
);

// Add device to group
devicesRoutes.post(
  "/groups/:groupId/devices/:deviceId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Check if device_groups table exists
      const tableExists = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'device_groups'
        );
        `,
      );

      if (!tableExists.rows[0]?.exists) {
        return res.status(501).json({
          success: false,
          error: "Device groups feature is not available",
        });
      }

      const { groupId, deviceId } = req.params;

      // Verify ownership
      const ownership = await pool.query(
        `SELECT 
        (SELECT user_id FROM device_groups WHERE id = $1) as group_user,
        (SELECT user_id FROM user_devices WHERE id = $2) as device_user
      `,
        [groupId, deviceId],
      );

      if (
        ownership.rows[0].group_user !== req.userId ||
        ownership.rows[0].device_user !== req.userId
      ) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      await pool.query(
        `INSERT INTO device_group_members (device_id, group_id)
       VALUES ($1, $2)
       ON CONFLICT (device_id, group_id) DO NOTHING`,
        [deviceId, groupId],
      );

      res.json({
        success: true,
        message: "Device added to group",
      });
    } catch (err) {
      console.error("Error adding device to group:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to add device to group" });
    }
  },
);

// Remove device from group
devicesRoutes.delete(
  "/groups/:groupId/devices/:deviceId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Check if device_groups table exists
      const tableExists = await pool.query(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'device_groups'
        );
        `,
      );

      if (!tableExists.rows[0]?.exists) {
        return res.status(501).json({
          success: false,
          error: "Device groups feature is not available",
        });
      }

      const { groupId, deviceId } = req.params;

      await pool.query(
        `DELETE FROM device_group_members 
       WHERE device_id = $1 AND group_id = $2`,
        [deviceId, groupId],
      );

      res.json({
        success: true,
        message: "Device removed from group",
      });
    } catch (err) {
      console.error("Error removing device from group:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to remove device from group" });
    }
  },
);

// ==================== REMOTE DEVICE ACTIONS ====================

// Force logout device
devicesRoutes.post(
  "/:deviceId/actions/logout",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;

      // Verify device ownership
      const device = await pool.query(
        `SELECT * FROM user_devices WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      if (device.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Device not found" });
      }

      if (device.rows[0].is_current) {
        return res.status(400).json({
          success: false,
          error:
            "Cannot force logout current device. Please use regular logout.",
        });
      }

      // Set force_logout flag
      await pool.query(
        `UPDATE user_devices SET force_logout = true WHERE id = $1`,
        [deviceId],
      );

      // Create action record (optional - table may not exist in all setups)
      try {
        await pool.query(
          `INSERT INTO device_actions (device_id, user_id, action_type, status)
         VALUES ($1, $2, 'logout', 'completed')`,
          [deviceId, req.userId],
        );
      } catch {
        // device_actions table may not exist
      }

      // Log action
      await logDeviceAction(
        deviceId,
        req.userId,
        "force_logout",
        {},
        req,
        pool,
      );

      res.json({
        success: true,
        message: "Device will be logged out on next activity",
      });
    } catch (err) {
      console.error("Error forcing logout:", err);
      res.status(500).json({ success: false, error: "Failed to force logout" });
    }
  },
);

// Lock device
devicesRoutes.post(
  "/:deviceId/actions/lock",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;
      const { message } = req.body;

      // Verify device ownership
      const device = await pool.query(
        `SELECT * FROM user_devices WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      if (device.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Device not found" });
      }

      // Lock the device
      await pool.query(
        `UPDATE user_devices 
       SET is_locked = true, 
           lock_message = $1,
           locked_at = NOW()
       WHERE id = $2`,
        [
          message || "This device has been locked by the account owner.",
          deviceId,
        ],
      );

      // Create action record (optional - table may not exist in all setups)
      try {
        await pool.query(
          `INSERT INTO device_actions (device_id, user_id, action_type, status, payload)
         VALUES ($1, $2, 'lock', 'completed', $3)`,
          [deviceId, req.userId, JSON.stringify({ message })],
        );
      } catch {
        // device_actions table may not exist
      }

      try {
        await logDeviceAction(
          deviceId,
          req.userId,
          "lock_device",
          { message },
          req,
          pool,
        );
      } catch {
        // device_activity_audit table may not exist
      }

      res.json({
        success: true,
        message: "Device locked successfully",
      });
    } catch (err) {
      console.error("Error locking device:", err);
      res.status(500).json({ success: false, error: "Failed to lock device" });
    }
  },
);

// Unlock device
devicesRoutes.post(
  "/:deviceId/actions/unlock",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;

      await pool.query(
        `UPDATE user_devices 
       SET is_locked = false, 
           lock_message = NULL,
           locked_at = NULL
       WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      // Create action record (optional)
      try {
        await pool.query(
          `INSERT INTO device_actions (device_id, user_id, action_type, status)
         VALUES ($1, $2, 'unlock', 'completed')`,
          [deviceId, req.userId],
        );
      } catch {
        // device_actions table may not exist
      }

      try {
        await logDeviceAction(
          deviceId,
          req.userId,
          "unlock_device",
          {},
          req,
          pool,
        );
      } catch {
        // device_activity_audit table may not exist
      }

      res.json({
        success: true,
        message: "Device unlocked successfully",
      });
    } catch (err) {
      console.error("Error unlocking device:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to unlock device" });
    }
  },
);

// Remote wipe device files
devicesRoutes.post(
  "/:deviceId/actions/wipe",
  authMiddleware,
  async (req: AuthRequest, res) => {
    const client = await pool.connect();

    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;
      const { confirmation } = req.body;

      if (confirmation !== "WIPE") {
        return res.status(400).json({
          success: false,
          error: "Please confirm wipe by sending 'WIPE' in confirmation field",
        });
      }

      await client.query("BEGIN");

      // Verify device ownership
      const device = await client.query(
        `SELECT * FROM user_devices WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      if (device.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ success: false, error: "Device not found" });
      }

      if (device.rows[0].is_current) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: "Cannot wipe current device for safety reasons",
        });
      }

      // Remove all device-file associations (pinned files, offline files, etc.)
      const deletedFiles = await client.query(
        `DELETE FROM device_files WHERE device_id = $1 RETURNING file_id`,
        [deviceId],
      );

      // Mark device as wiped
      await client.query(
        `UPDATE user_devices 
       SET wiped_at = NOW(),
           is_locked = true,
           lock_message = 'This device has been remotely wiped',
           force_logout = true
       WHERE id = $1`,
        [deviceId],
      );

      // Create action record
      await client.query(
        `INSERT INTO device_actions (device_id, user_id, action_type, status, payload)
       VALUES ($1, $2, 'wipe', 'completed', $3)`,
        [
          deviceId,
          req.userId,
          JSON.stringify({ files_removed: deletedFiles.rows.length }),
        ],
      );

      // Log action
      await client.query(
        `INSERT INTO device_activity_audit (device_id, user_id, action, details, ip_address, user_agent)
       VALUES ($1, $2, 'remote_wipe', $3, $4, $5)`,
        [
          deviceId,
          req.userId,
          JSON.stringify({ files_removed: deletedFiles.rows.length }),
          req.ip || req.headers["x-forwarded-for"],
          req.headers["user-agent"],
        ],
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message: `Device wiped successfully. ${deletedFiles.rows.length} file associations removed.`,
        files_removed: deletedFiles.rows.length,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error wiping device:", err);
      res.status(500).json({ success: false, error: "Failed to wipe device" });
    } finally {
      client.release();
    }
  },
);

// Get device actions history
devicesRoutes.get(
  "/:deviceId/actions",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;

      const actions = await pool.query(
        `SELECT * FROM device_actions
       WHERE device_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 50`,
        [deviceId, req.userId],
      );

      res.json({
        success: true,
        actions: actions.rows,
      });
    } catch (err) {
      console.error("Error fetching device actions:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch actions" });
    }
  },
);

// Get device audit log
devicesRoutes.get(
  "/:deviceId/audit",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;

      const audit = await pool.query(
        `SELECT * FROM device_activity_audit
       WHERE device_id = $1 AND user_id = $2
       ORDER BY created_at DESC
       LIMIT 100`,
        [deviceId, req.userId],
      );

      res.json({
        success: true,
        audit: audit.rows,
      });
    } catch (err) {
      console.error("Error fetching audit log:", err);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch audit log" });
    }
  },
);

// Update device (rename)
devicesRoutes.patch(
  "/:deviceId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;
      const { device_nickname } = req.body;

      if (!device_nickname || device_nickname.trim() === "") {
        return res.status(400).json({
          success: false,
          error: "Device nickname is required",
        });
      }

      // Verify device ownership
      const device = await pool.query(
        `SELECT * FROM user_devices WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      if (device.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Device not found" });
      }

      // Update device nickname
      const result = await pool.query(
        `UPDATE user_devices 
         SET device_nickname = $1
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [device_nickname.trim(), deviceId, req.userId],
      );

      res.json({
        success: true,
        device: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating device:", err);
      res.status(500).json({ success: false, error: "Failed to update device" });
    }
  },
);

// Remove device
devicesRoutes.delete(
  "/:deviceId",
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { deviceId } = req.params;

      // Verify device ownership
      const device = await pool.query(
        `SELECT * FROM user_devices WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      if (device.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, error: "Device not found" });
      }

      if (device.rows[0].is_current) {
        return res.status(400).json({
          success: false,
          error: "Cannot remove current device",
        });
      }

      // Remove device-file associations
      await pool.query(
        `DELETE FROM device_files WHERE device_id = $1`,
        [deviceId],
      );

      // Remove device from groups
      await pool.query(
        `DELETE FROM device_group_members WHERE device_id = $1`,
        [deviceId],
      );

      // Delete device
      await pool.query(
        `DELETE FROM user_devices WHERE id = $1 AND user_id = $2`,
        [deviceId, req.userId],
      );

      // Log action
      await logDeviceAction(
        deviceId,
        req.userId,
        "remove_device",
        {},
        req,
        pool,
      );

      res.json({
        success: true,
        message: "Device removed successfully",
      });
    } catch (err) {
      console.error("Error removing device:", err);
      res.status(500).json({ success: false, error: "Failed to remove device" });
    }
  },
);

export default devicesRoutes;
