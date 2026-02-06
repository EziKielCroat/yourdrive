import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { AuthService } from "../services/auth.service";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { DeviceService } from "../services/device.service";

const authRoutes = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: "Too many accounts created from this IP. Try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many login attempts from this IP. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many password reset attempts. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// Registration & Login Routes
// ============================================

authRoutes.post(
  "/register",
  registerLimiter,
  async (req: Request, res: Response) => {
    try {
      const { email, password, firstName } = req.body;

      const user = await AuthService.register({
        email,
        password,
        firstName,
      });

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
  },
);

authRoutes.post("/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, deviceName } = req.body;

    const deviceInfo = {
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || (req.headers["x-forwarded-for"] as string) || "",
    };

    const result = await AuthService.login(email, password, {
      ...deviceInfo,
      deviceName,
    });

    if (result.requires2FA) {
      return res.json({
        success: true,
        requires2FA: true,
        tempToken: result.tempToken,
      });
    }

    // Track device
    const device = await DeviceService.trackDevice(
      result.user.id,
      deviceInfo,
      deviceName,
    );

    // Set cookies
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

    res.clearCookie("deviceId", {
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

// Cookie-based /me endpoint (works with refresh token cookie)
authRoutes.get("/me", async (req: Request, res: Response) => {
  try {
    // Try to get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // Not authenticated, but don't throw error - just return unauthenticated state
      return res.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    // Verify refresh token and get user
    const { userId } = await AuthService.verifyRefreshToken(refreshToken);
    const user = await AuthService.getUserById(userId);

    res.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error: any) {
    // If token is invalid, return unauthenticated state instead of error
    res.json({
      success: true,
      authenticated: false,
      user: null,
    });
  }
});

// Bearer token-based /me endpoint (for protected routes in main app)
authRoutes.get(
  "/me/protected",
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
  },
);

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

// ============================================
// Password Reset Routes
// ============================================

authRoutes.post(
  "/password/forgot",
  passwordResetLimiter,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required",
        });
      }

      const result = await AuthService.requestPasswordReset(email);

      res.json({
        success: true,
        message: result.message,
        userId: result.userId, // Return userId if user exists
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process password reset request",
      });
    }
  },
);

authRoutes.post(
  "/password/verify-code",
  async (req: Request, res: Response) => {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        return res.status(400).json({
          success: false,
          error: "User ID and code are required",
        });
      }

      const result = await AuthService.verifyResetCode(userId, code);

      res.json({
        success: true,
        isValid: result.isValid,
        resetToken: result.resetToken,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.post(
  "/password/reset",
  async (req: Request, res: Response) => {
    try {
      const { resetToken, newPassword } = req.body;

      if (!resetToken || !newPassword) {
        return res.status(400).json({
          success: false,
          error: "Reset token and new password are required",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: "Password must be at least 8 characters",
        });
      }

      const result = await AuthService.resetPassword(resetToken, newPassword);

      res.json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

// ============================================
// Device Routes
// ============================================

authRoutes.get(
  "/device/current",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const deviceId = req.cookies.deviceId;

      if (!deviceId) {
        return res.status(404).json({
          success: false,
          error: "No device ID found",
        });
      }

      const device = await DeviceService.getDevice(deviceId, req.userId!);

      res.json({
        success: true,
        device,
      });
    } catch (error: any) {
      if (error.message === "Device not found") {
        return res.status(404).json({
          success: false,
          error: "Device not found",
        });
      }

      console.error("Current device error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to resolve current device",
      });
    }
  },
);

// ============================================
// 2FA / TOTP Routes
// ============================================

authRoutes.post(
  "/totp/setup",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      console.log("=== TOTP Setup Request ===");
      console.log("User ID:", req.userId);
      console.log("Auth header:", req.headers.authorization);
      
      const result = await AuthService.setupTOTP(req.userId!);

      console.log("=== TOTP Setup Success ===");
      console.log("Secret generated:", result.secret);

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("=== TOTP Setup Error ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.post(
  "/totp/verify-and-enable",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const raw = req.body?.token ?? req.body?.code;
      const token =
        raw !== undefined && raw !== null
          ? String(raw).trim().replace(/\s/g, "")
          : "";
      if (!token || !/^\d{6}$/.test(token)) {
        return res.status(400).json({
          success: false,
          error: "Please provide a valid 6-digit code",
          message: "Please provide a valid 6-digit code",
        });
      }
      const result = await AuthService.verifyAndEnableTOTP(req.userId!, token);

      res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      const msg = error?.message || "Failed to verify code";
      res.status(400).json({
        success: false,
        error: msg,
        message: msg,
      });
    }
  },
);

authRoutes.post("/totp/verify", async (req: Request, res: Response) => {
  try {
    const { tempToken, token, recoveryCode } = req.body;

    let result;
    if (recoveryCode) {
      result = await AuthService.completeTOTPLoginWithRecoveryCode(
        tempToken,
        recoveryCode,
      );
    } else {
      result = await AuthService.completeTOTPLogin(tempToken, token);
    }

    // Track device
    const deviceInfo = {
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip || (req.headers["x-forwarded-for"] as string) || "",
    };

    const device = await DeviceService.trackDevice(
      result.user.id,
      deviceInfo,
      "2FA Login",
    );

    // Set cookies
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
      maxAge: 365 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      currentDevice: device,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

authRoutes.post(
  "/totp/disable",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      await AuthService.disableTOTP(req.userId!);

      res.json({
        success: true,
        message: "2FA disabled successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

// ============================================
// WebAuthn / Passkey Routes
// ============================================

authRoutes.get(
  "/webauthn/registration-options",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const options = await AuthService.generateWebAuthnRegistrationOptions(
        req.userId!,
      );

      req.session.challenge = options.challenge;

      res.json({
        success: true,
        options,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.post(
  "/webauthn/register",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { response: credentialResponse, deviceName } = req.body;

      await AuthService.verifyWebAuthnRegistration(
        req.userId!,
        credentialResponse,
        deviceName,
      );

      res.json({
        success: true,
        message: "Passkey registered successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.get(
  "/webauthn/authentication-options",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.query;

      let userId: string | undefined;
      if (email) {
        const { default: prisma } = await import("../lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: email as string },
        });
        userId = user?.id;
      }

      const options =
        await AuthService.generateWebAuthnAuthenticationOptions(userId);

      if (req.session) {
        req.session.challenge = options.challenge;
      }

      res.json({
        success: true,
        options,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.post(
  "/webauthn/authenticate",
  async (req: Request, res: Response) => {
    try {
      const { response: credentialResponse } = req.body;

      const user =
        await AuthService.verifyWebAuthnAuthentication(credentialResponse);

      console.log(user);

      // Generate tokens
      const accessToken = AuthService.generateAccessToken(user.id);
      const refreshToken = AuthService.generateRefreshToken(user.id);

      // Create session
      const { default: prisma } = await import("../lib/prisma");
      const bcrypt = await import("bcryptjs");
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: hashedRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      // Track device
      const deviceInfo = {
        userAgent: req.headers["user-agent"] || "",
        ip: req.ip || (req.headers["x-forwarded-for"] as string) || "",
      };

      const device = await DeviceService.trackDevice(
        user.id,
        deviceInfo,
        "Passkey Login",
      );

      // Set cookies
      res.cookie("refreshToken", refreshToken, {
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
        maxAge: 365 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          emailVerified: user.emailVerified,
        },
        accessToken,
        currentDevice: device,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.get(
  "/passkeys",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const passkeys = await AuthService.getUserPasskeys(req.userId!);

      res.json({
        success: true,
        passkeys,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.delete(
  "/passkeys/:passkeyId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { passkeyId } = req.params;

      await AuthService.deletePasskey(req.userId!, passkeyId);

      res.json({
        success: true,
        message: "Passkey deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

// ============================================
// Email Verification Routes
// ============================================

authRoutes.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    console.log(`🔍 Verify email endpoint called with token: ${token}`);

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        error: "Verification token is required",
      });
    }

    const result = await AuthService.verifyEmail(token);

    console.log(`✅ Verification result:`, result);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("❌ Verification route error:", error);
    console.error("Stack trace:", error.stack);
    
    res.status(400).json({
      success: false,
      error: error.message || "Verification failed",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

authRoutes.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const result = await AuthService.resendVerificationEmail(email);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});


// ============================================
// Social Accounts Routes
// ============================================

authRoutes.get(
  "/social-accounts",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const accounts = await AuthService.getUserSocialAccounts(req.userId!);

      res.json({
        success: true,
        accounts,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

authRoutes.delete(
  "/social-accounts/:provider",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { provider } = req.params;

      await AuthService.unlinkSocialAccount(req.userId!, provider);

      res.json({
        success: true,
        message: "Social account unlinked successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },
);

export default authRoutes;