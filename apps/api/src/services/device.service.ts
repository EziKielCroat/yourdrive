import { Pool } from "pg";
import { UAParser } from "ua-parser-js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class DeviceService {
  static async trackDevice(
    userId: string,
    deviceInfo: { userAgent: string; ip: string },
    customName?: string
  ) {
    const parser = new UAParser(deviceInfo.userAgent);
    const result = parser.getResult();

    const deviceType = result.device.type || "desktop";
    const browser = result.browser.name || "Unknown";
    const os = result.os.name || "Unknown";

    let deviceName = customName;
    if (!deviceName) {
      // Generate a more descriptive device name
      const osName = os.split(" ")[0]; // e.g., "Windows", "macOS", "Linux"
      const deviceTypeName =
        deviceType.charAt(0).toUpperCase() + deviceType.slice(1); // Capitalize

      // Format: "Type (OS)" - e.g., "Desktop (Windows)", "Mobile (Android)", "Tablet (iOS)"
      deviceName = `${deviceTypeName} (${osName})`;
    }

    const existingDevice = await pool.query(
      `SELECT id FROM user_devices 
       WHERE user_id = $1 AND user_agent = $2
       LIMIT 1`,
      [userId, deviceInfo.userAgent]
    );

    let deviceId: string;

    if (existingDevice.rows.length > 0) {
      deviceId = existingDevice.rows[0].id;
      await pool.query(
        `UPDATE user_devices 
         SET last_active = NOW(), ip_address = $1, is_current = true
         WHERE id = $2`,
        [deviceInfo.ip, deviceId]
      );

      await pool.query(
        `UPDATE user_devices 
         SET is_current = false
         WHERE user_id = $1 AND id != $2`,
        [userId, deviceId]
      );
    } else {
      const newDevice = await pool.query(
        `INSERT INTO user_devices (user_id, device_name, device_type, browser, os, ip_address, user_agent, is_current)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING id`,
        [
          userId,
          deviceName,
          deviceType,
          browser,
          os,
          deviceInfo.ip,
          deviceInfo.userAgent,
        ]
      );

      deviceId = newDevice.rows[0].id;

      await pool.query(
        `UPDATE user_devices 
         SET is_current = false
         WHERE user_id = $1 AND id != $2`,
        [userId, deviceId]
      );
    }

    const device = await pool.query(
      `SELECT id, device_name, device_type, browser, os, last_active, created_at, is_current
       FROM user_devices
       WHERE id = $1`,
      [deviceId]
    );

    return device.rows[0];
  }

  static async getDevice(deviceId: string, userId: string) {
    const result = await pool.query(
      `SELECT id, device_name, device_type, browser, os, last_active, created_at, is_current
       FROM user_devices
       WHERE id = $1 AND user_id = $2`,
      [deviceId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Device not found");
    }

    return result.rows[0];
  }

  static async getUserDevices(userId: string) {
    const result = await pool.query(
      `SELECT id, device_name, device_type, browser, os, last_active, created_at, is_current
       FROM user_devices
       WHERE user_id = $1
       ORDER BY last_active DESC`,
      [userId]
    );

    return result.rows;
  }

  static async updateDeviceName(
    deviceId: string,
    userId: string,
    name: string
  ) {
    const result = await pool.query(
      `UPDATE user_devices
       SET device_name = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, device_name, device_type, browser, os, last_active, created_at, is_current`,
      [name, deviceId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Device not found");
    }

    return result.rows[0];
  }

  static async removeDevice(deviceId: string, userId: string) {
    const result = await pool.query(
      `DELETE FROM user_devices
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [deviceId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Device not found");
    }
  }
}
