import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { AuthService } from "../services/auth.service";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { DeviceService } from "../services/device.service";

const authRoutes = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many accounts created from this IP. Try again in an hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts from this IP. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

authRoutes.post(
  "/register",
  registerLimiter,
  async (req: Request, res: Response) => {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: error.errors[0].message,
        });
      }

      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

authRoutes.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);

    const deviceInfo = {
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || (req.headers["x-forwarded-for"] as string) || "",
    };

    const device = await DeviceService.trackDevice(
      result.user.id,
      deviceInfo,
      req.body.deviceName
    );

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.cookie("deviceId", device.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      path: "/",
    });

    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      currentDevice: device,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      });
    }

    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

authRoutes.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: "No refresh token provided",
      });
    }

    const result = await AuthService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired refresh token",
    });
  }
});

authRoutes.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await AuthService.getUserById(req.userId!);

      res.json({
        success: true,
        user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
);

authRoutes.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

authRoutes.get("/status", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: true,
        isAuthenticated: false,
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyAccessToken(token);

    res.json({
      success: true,
      isAuthenticated: true,
      userId: decoded.userId,
    });
  } catch (error) {
    res.json({
      success: true,
      isAuthenticated: false,
    });
  }
});

authRoutes.get(
  "/device/current",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const deviceId = req.cookies.deviceId;

      if (!deviceId) {
        return res.status(404).json({
          success: false,
          error: "No device information found",
        });
      }

      const device = await DeviceService.getDevice(deviceId, req.userId!);

      res.json({
        success: true,
        device,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
);

authRoutes.get(
  "/devices",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const devices = await DeviceService.getUserDevices(req.userId!);

      res.json({
        success: true,
        devices,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

authRoutes.patch(
  "/device/:deviceId/name",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { deviceId } = req.params;
      const { name } = req.body;

      const device = await DeviceService.updateDeviceName(
        deviceId,
        req.userId!,
        name
      );

      res.json({
        success: true,
        device,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

authRoutes.delete(
  "/device/:deviceId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { deviceId } = req.params;

      await DeviceService.removeDevice(deviceId, req.userId!);

      res.json({
        success: true,
        message: "Device removed successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default authRoutes;
