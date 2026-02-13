import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode";

import { BigIntHelper } from "../lib/bigint-helper";

import crypto from "crypto";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/types";
import prisma from "../lib/prisma";

import { EmailService, emailService } from "../lib/email.service";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "your-access-secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
const JWT_TEMP_SECRET = process.env.JWT_TEMP_SECRET || "your-temp-secret";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  deviceName: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
});

// Types
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  emailVerified: boolean;
  totpSecret: string | null;
  totpEnabled: boolean;
  loginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginResult {
  requires2FA: true;
  userId: string;
  tempToken: string;
}

interface LoginSuccessResult {
  requires2FA: false;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

type LoginResponse = LoginResult | LoginSuccessResult;

interface TotpSetupResponse {
  secret: string;
  qrCode: string;
  otpauthUrl: string;
}

interface TotpEnableResponse {
  success: boolean;
  recoveryCodes: string[];
}

interface CompleteTotpLoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

interface SocialUserProfile {
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  avatar?: string;
  [key: string]: any;
}

export class AuthService {
  // ============================================
  // JWT Token Methods
  // ============================================

  static generateAccessToken(userId: string): string {
    return jwt.sign({ userId, type: "access" }, JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: "refresh" }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
  }

  static generateTempToken(userId: string): string {
    return jwt.sign(
      { userId, type: "temp" },
      JWT_TEMP_SECRET || JWT_ACCESS_SECRET,
      {
        expiresIn: "5m",
      },
    );
  }

  static verifyTempToken(token: string): { userId: string; type: string } {
    try {
      const decoded = jwt.verify(
        token,
        JWT_TEMP_SECRET || JWT_ACCESS_SECRET,
      ) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== "temp") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired temp token");
    }
  }

  static verifyAccessToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }

      return { userId: decoded.userId };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async verifyRefreshToken(
    refreshToken: string,
  ): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      // Check if session exists
      const sessions = await prisma.session.findMany({
        where: { userId: decoded.userId, expiresAt: { gt: new Date() } },
      });

      let sessionFound = false;
      for (const session of sessions) {
        const isMatch = await bcrypt.compare(
          refreshToken,
          session.refreshToken,
        );
        if (isMatch) {
          sessionFound = true;
          break;
        }
      }

      if (!sessionFound) {
        throw new Error("Session not found");
      }

      return { userId: decoded.userId };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  // ============================================
  // Failed Login Handler
  // ============================================

  private static async handleFailedLogin(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });

    if (!user) return;

    const attempts = (user.loginAttempts || 0) + 1;
    const lockUntil =
      attempts >= 5
        ? new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
        : null;

    await prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: attempts,
        lockUntil,
      },
    });
  }

  // ============================================
  // Registration & Login
  // ============================================

  static async register(data: z.infer<typeof registerSchema>) {
  const validated = registerSchema.parse(data);

  const existingUser = await prisma.user.findUnique({
    where: { email: validated.email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10);

  // Check if it's a school email
  const isSkoleUser = validated.email.toLowerCase().endsWith("@skole.hr");
  console.log(`🎓 Registration - Is @skole.hr user: ${isSkoleUser}`);

  // Base storage - NO BONUS YET (bonus comes after email verification)
  // FIX: Use BigIntHelper for consistent BigInt handling
  const BASE_STORAGE = BigIntHelper.gbToBytes(50); // 50GB base
  
  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  console.log(`🔄 Creating user with base storage: ${BigIntHelper.formatBytes(BASE_STORAGE)}`);
  
  const user = await prisma.$transaction(async (tx: any) => {
    const createdUser = await tx.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        firstName: validated.firstName,
        emailVerified: false, // Not verified yet
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    console.log(`✅ User created: ${createdUser.email}`);

    await tx.userSettings.create({
      data: {
        userId: createdUser.id,
      },
    });

    console.log(`✅ User settings created`);

    // Create device with BASE storage only
    await tx.userDevice.create({
      data: {
        userId: createdUser.id,
        deviceName: "Primary Device",
        deviceType: "web",
        storageLimit: BASE_STORAGE, // Start with base 50GB
        isCurrent: true,
      },
    });

    console.log(`✅ User device created with ${BigIntHelper.formatBytes(BASE_STORAGE)} storage`);

    return createdUser;
  });

  // Send verification email
  try {
    console.log(`📧 Sending verification email to ${validated.email}`);
    await emailService.sendVerificationEmail(
      validated.email, 
      validated.firstName, 
      verificationToken,
      isSkoleUser
    );
    console.log(`✅ Verification email sent to ${validated.email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    // Don't fail registration if email fails
  }

  const message = isSkoleUser 
    ? "Registration successful! Please check your email to verify your account and receive your 50GB educational bonus."
    : "Registration successful! Please check your email to verify your account.";

  return {
    ...user,
    message,
    requiresVerification: true,
    isSkoleUser,
  };
}

static async verifyEmail(token: string): Promise<{ 
  success: boolean; 
  message: string;
  bonusGranted: boolean;
  newStorageLimit?: string;
  educationalBonus?: string;
  alreadyVerified?: boolean;
}> {
  try {
    console.log(`🔍 Verifying email with token: ${token.substring(0, 10)}...`);

    // FIRST: Check if user is already verified (handle duplicate calls)
    const alreadyVerifiedUser = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
      include: {
        userDevices: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });

    if (alreadyVerifiedUser && alreadyVerifiedUser.emailVerified) {
      console.log(`✅ User ${alreadyVerifiedUser.email} is already verified`);
      
      // Check storage status even though already verified
      const isSkoleUser = alreadyVerifiedUser.email.toLowerCase().endsWith("@skole.hr");
      let hasBonus = false;
      let currentStorage = "0";
      
      if (isSkoleUser && alreadyVerifiedUser.userDevices[0]) {
        const currentLimit = BigIntHelper.toBigInt(alreadyVerifiedUser.userDevices[0].storageLimit);
        const baseStorage = BigIntHelper.gbToBytes(50);
        const bonusStorage = BigIntHelper.gbToBytes(50);
        const expectedStorageWithBonus = baseStorage + bonusStorage;
        
        hasBonus = currentLimit >= expectedStorageWithBonus;
        currentStorage = BigIntHelper.formatBytes(currentLimit);
      }

      return {
        success: true,
        message: hasBonus 
          ? `Email already verified! You have ${currentStorage} total storage (includes 50GB educational bonus).`
          : "Email already verified!",
        bonusGranted: hasBonus,
        alreadyVerified: true,
        newStorageLimit: alreadyVerifiedUser.userDevices[0]?.storageLimit?.toString(),
        educationalBonus: hasBonus ? "50GB" : undefined,
      };
    }

    // SECOND: Try to find user by token with valid expiry
    const userByToken = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
      include: {
        userDevices: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    });

    if (!userByToken) {
      console.log('❌ No user found with this token or token expired');
      
      // Check if token exists but expired
      const expiredTokenUser = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
        },
      });
      
      if (expiredTokenUser) {
        throw new Error("Verification token has expired. Please request a new verification email.");
      } else {
        throw new Error("Invalid verification token");
      }
    }

    console.log(`👤 User found: ${userByToken.email} (ID: ${userByToken.id})`);
    console.log(`📧 Email currently verified: ${userByToken.emailVerified}`);
    console.log(`💾 Has current device: ${userByToken.userDevices.length > 0}`);
    
    if (userByToken.userDevices[0]) {
      console.log(`📊 Current device storage: ${userByToken.userDevices[0].storageLimit}`);
    }

    // Check if it's a @skole.hr user
    const isSkoleUser = userByToken.email.toLowerCase().endsWith("@skole.hr");
    console.log(`🎓 Is @skole.hr user: ${isSkoleUser}`);
    
    let newStorageLimit: bigint | undefined;
    let bonusGranted = false;
    let educationalBonus = "0";

    // Update user and grant bonus if applicable
    console.log('🔄 Starting database transaction...');
    await prisma.$transaction(async (tx: any) => {
      // Mark email as verified (and clear token in the same operation)
      console.log('✅ Marking email as verified and clearing token');
      await tx.user.update({
        where: { id: userByToken.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null, // Clear token immediately
          emailVerificationExpires: null,
        },
      });

      // If @skole.hr user, add 50GB bonus
      if (isSkoleUser) {
        console.log(`✨ Processing educational bonus for skole.hr user`);
        
        if (userByToken.userDevices[0]) {
          const currentDevice = userByToken.userDevices[0];
          console.log(`💾 Current device ID: ${currentDevice.id}`);
          console.log(`📦 Current storage limit: ${currentDevice.storageLimit}`);
          
          // Get current limit or use 50GB as base
          const BASE_STORAGE = BigIntHelper.gbToBytes(50);
          const currentLimit = currentDevice.storageLimit 
            ? BigIntHelper.toBigInt(currentDevice.storageLimit)
            : BASE_STORAGE;
          
          const BONUS = BigIntHelper.gbToBytes(50); // 50GB bonus
          
          console.log(`💰 Current limit: ${currentLimit} (${BigIntHelper.formatBytes(currentLimit)})`);
          console.log(`🎁 Bonus to add: ${BONUS} (${BigIntHelper.formatBytes(BONUS)})`);
          
          newStorageLimit = BigIntHelper.add(currentLimit, BONUS);
          bonusGranted = true;
          educationalBonus = BigIntHelper.formatBytes(BONUS);

          console.log(`📈 New storage limit: ${newStorageLimit} (${BigIntHelper.formatBytes(newStorageLimit)})`);
          
          await tx.userDevice.update({
            where: { id: currentDevice.id },
            data: {
              storageLimit: newStorageLimit,
            },
          });

          console.log('✅ Educational bonus applied to device');
        } else {
          console.log('⚠️ No current device found for user, creating one with bonus...');
          
          // Create a device with 100GB (50GB base + 50GB bonus)
          const BASE_STORAGE = BigIntHelper.gbToBytes(50);
          const BONUS = BigIntHelper.gbToBytes(50);
          newStorageLimit = BigIntHelper.add(BASE_STORAGE, BONUS);
          bonusGranted = true;
          educationalBonus = BigIntHelper.formatBytes(BONUS);
          
          await tx.userDevice.create({
            data: {
              userId: userByToken.id,
              deviceName: "Primary Device",
              deviceType: "web",
              storageLimit: newStorageLimit,
              isCurrent: true,
            },
          });
          
          console.log('✅ Created new device with educational bonus');
        }
      } else {
        console.log('ℹ️ No educational bonus - not a skole.hr user');
      }
    });

    console.log('✅ Transaction completed successfully');

    // Send welcome email
    try {
      console.log(`📧 Sending welcome email to ${userByToken.email}`);
      await emailService.sendWelcomeEmail(userByToken.email, userByToken.firstName || undefined, bonusGranted);
      console.log('✅ Welcome email sent');
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
    }

    const message = bonusGranted
      ? `Email verified successfully! You've received ${educationalBonus} educational bonus! Total storage: ${BigIntHelper.formatBytes(newStorageLimit!)}`
      : "Email verified successfully!";

    console.log(`🎉 Verification completed: ${message}`);

    return {
      success: true,
      message,
      bonusGranted,
      newStorageLimit: newStorageLimit?.toString(),
      educationalBonus: bonusGranted ? educationalBonus : undefined,
      alreadyVerified: false,
    };
  } catch (error: any) {
    console.error("❌ Email verification error:", error);
    console.error("Stack trace:", error.stack);
    throw new Error(error.message || "Email verification failed");
  }
}

static async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists
    return {
      success: true,
      message: "If an account with this email exists, a verification email has been sent.",
    };
  }

  if (user.emailVerified) {
    return {
      success: true,
      message: "Email is already verified.",
    };
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

  const isSkoleUser = user.email.toLowerCase().endsWith("@skole.hr");

  try {
    await emailService.sendVerificationEmail(
      user.email,
      user.firstName || undefined,
      verificationToken,
      isSkoleUser
    );
    console.log(`✅ Resent verification email to ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to resend verification email:", error);
    throw new Error("Failed to send verification email");
  }

  const message = isSkoleUser
    ? "Verification email sent! Verify to receive 50GB educational bonus."
    : "Verification email sent successfully.";

  return {
    success: true,
    message,
  };
}

  static async login(
    email: string,
    password: string,
    deviceInfo?: { userAgent?: string; ip?: string; deviceName?: string },
  ): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000,
      );
      throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      await this.handleFailedLogin(user.id);
      throw new Error("Invalid email or password");
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null },
    });

    // Check if 2FA is enabled
    if (user.totpEnabled) {
      return {
        requires2FA: true,
        userId: user.id,
        tempToken: this.generateTempToken(user.id),
      };
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Create session
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      requires2FA: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  static async loginWithPassword(
    data: z.infer<typeof loginSchema>,
  ): Promise<LoginResponse> {
    const validated = loginSchema.parse(data);
    return this.login(validated.email, validated.password, {
      deviceName: validated.deviceName,
    });
  }

  static async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const { userId } = await this.verifyRefreshToken(refreshToken);

      // Generate new access token
      const accessToken = this.generateAccessToken(userId);

      return { accessToken };
    } catch (error: any) {
      throw new Error("Token refresh failed");
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      const { userId } = await this.verifyRefreshToken(refreshToken);

      // Find and delete the session
      const sessions = await prisma.session.findMany({
        where: { userId },
      });

      for (const session of sessions) {
        const isMatch = await bcrypt.compare(
          refreshToken,
          session.refreshToken,
        );
        if (isMatch) {
          await prisma.session.delete({
            where: { id: session.id },
          });
          break;
        }
      }
    } catch (error) {
      // If token is invalid, just clear the session
      console.error("Logout error:", error);
    }
  }

  static async getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      emailVerified: true,
      totpEnabled: true,
      createdAt: true,
      // Add storage info through userDevices
      userDevices: {
        where: { isCurrent: true },
        select: {
          storageLimit: true,
          deviceName: true,
        },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Calculate used storage
  const usedStorage = await prisma.userFile.aggregate({
    where: {
      userId,
      deletedAt: null,
    },
    _sum: {
      size: true,
    },
  });

  const currentDevice = user.userDevices[0];
  
  // FIX: Use BigIntHelper for safe BigInt conversion
  const storageLimit = BigIntHelper.toBigInt(currentDevice?.storageLimit || BigIntHelper.gbToBytes(50));
  const used = BigIntHelper.toBigInt(usedStorage._sum.size);
  const isSkoleUser = user.email.toLowerCase().endsWith("@skole.hr");
  
  return {
    ...user,
    storageInfo: {
      limit: storageLimit.toString(),
      used: used.toString(),
      available: (storageLimit - used).toString(),
      usagePercentage: BigIntHelper.calculatePercentage(used, storageLimit),
      deviceName: currentDevice?.deviceName || "Primary Device",
      isEducational: isSkoleUser && user.emailVerified,
      hasBonus: isSkoleUser && user.emailVerified,
    },
    isSkoleUser,
  };
}

  // ============================================
  // 2FA / TOTP Methods
  // ============================================

  static async setupTOTP(userId: string): Promise<TotpSetupResponse> {
    const secret = authenticator.generateSecret();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate QR code
    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.RP_NAME || "YourDrive",
      secret,
    );

    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Store secret
    await prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret },
    });

    return {
      secret,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    };
  }

  static async verifyAndEnableTOTP(
    userId: string,
    token: string,
  ): Promise<TotpEnableResponse> {
    const code = typeof token === "string" ? token.trim() : "";
    if (!code || code.length !== 6) {
      throw new Error("A valid 6-digit code is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true },
    });

    if (!user?.totpSecret) {
      throw new Error(
        "TOTP setup not found. Please start the setup again (scan the QR code first).",
      );
    }

    let isValid: boolean;
    try {
      isValid = authenticator.verify({
        token: code,
        secret: user.totpSecret,
      });
    } catch (err) {
      throw new Error("Invalid or expired code. Please try again.");
    }

    if (!isValid) {
      throw new Error("Invalid TOTP code. Please check the code and try again.");
    }

    // Generate recovery codes
    const recoveryCodes = await this.generateRecoveryCodes(userId);

    // Enable TOTP
    await prisma.user.update({
      where: { id: userId },
      data: { totpEnabled: true },
    });

    return { success: true, recoveryCodes };
  }

  static async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true, totpEnabled: true },
    });

    if (!user?.totpSecret || !user.totpEnabled) {
      throw new Error("2FA not enabled");
    }

    const isValid = authenticator.verify({
      token,
      secret: user.totpSecret,
    });

    if (!isValid) {
      throw new Error("Invalid 2FA code");
    }

    return true;
  }

  static async disableTOTP(userId: string): Promise<{ success: boolean }> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: null,
        totpEnabled: false,
      },
    });

    // Delete recovery codes
    await prisma.totpRecoveryCode.deleteMany({
      where: { userId },
    });

    return { success: true };
  }

  private static async generateRecoveryCodes(
    userId: string,
  ): Promise<string[]> {
    const codes: string[] = [];

    // Generate 10 recovery codes
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);

      const codeHash = await bcrypt.hash(code, 10);
      await prisma.totpRecoveryCode.create({
        data: {
          userId,
          codeHash,
        },
      });
    }

    return codes;
  }

  static async verifyRecoveryCode(
    userId: string,
    code: string,
  ): Promise<boolean> {
    const recoveryCodes = await prisma.totpRecoveryCode.findMany({
      where: {
        userId,
        used: false,
      },
    });

    for (const recoveryCode of recoveryCodes) {
      const isValid = await bcrypt.compare(code, recoveryCode.codeHash);

      if (isValid) {
        await prisma.totpRecoveryCode.update({
          where: { id: recoveryCode.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });

        return true;
      }
    }

    throw new Error("Invalid recovery code");
  }

  static async completeTOTPLogin(
    tempToken: string,
    totpCode: string,
  ): Promise<CompleteTotpLoginResponse> {
    const decoded = this.verifyTempToken(tempToken);

    // Verify TOTP code
    await this.verifyTOTP(decoded.userId, totpCode);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  static async completeTOTPLoginWithRecoveryCode(
    tempToken: string,
    recoveryCode: string,
  ): Promise<CompleteTotpLoginResponse> {
    const decoded = this.verifyTempToken(tempToken);

    await this.verifyRecoveryCode(decoded.userId, recoveryCode);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  // ============================================
  // Password Reset Methods
  // ============================================

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: "If an account with this email exists, a reset code has been sent.",
      };
    }

    // Generate reset code and token
    const resetCode = EmailService.generateResetCode();  // Call on class
    const resetToken = EmailService.generateResetToken();  // Call on class
    const codeHash = await EmailService.hashResetCode(resetCode);  // Call on class
    
    // Set expiration to 15 minutes
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Store reset token and code hash in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetCodeHash: codeHash,
        passwordResetExpires: resetExpires,
      },
    });

    // Send email
    await emailService.sendPasswordResetEmail(email, resetCode, resetToken, user.id);

    console.log(`Password reset code for ${email}: ${resetCode}`);
    console.log(`User ID: ${user.id}`);

    return {
      success: true,
      message: "If an account with this email exists, a reset code has been sent.",
      userId: user.id, // Return userId for frontend
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    throw new Error("Failed to process password reset request");
  }
}

static async verifyResetCode(userId: string, code: string): Promise<{ isValid: boolean; resetToken: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        passwordResetToken: true,
        passwordResetCodeHash: true,
        passwordResetExpires: true,
      },
    });

    if (!user?.passwordResetToken || !user.passwordResetCodeHash || !user.passwordResetExpires) {
      throw new Error("No reset request found");
    }

    // Check if reset code has expired
    if (user.passwordResetExpires < new Date()) {
      // Clear expired reset data
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordResetToken: null,
          passwordResetCodeHash: null,
          passwordResetExpires: null,
        },
      });
      throw new Error("Reset code has expired");
    }

    // Verify the code
    const isValid = await emailService.verifyResetCode(user.passwordResetCodeHash, code);
    
    if (!isValid) {
      throw new Error("Invalid reset code");
    }

    console.log(`Code verification successful for user ${userId}`);

    return {
      isValid: true,
      resetToken: user.passwordResetToken,
    };
  } catch (error) {
    console.error("Verify code error:", error);
    throw new Error("Invalid or expired reset code");
  }
}

  static async resetPassword(resetToken: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      // Find user by reset token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: resetToken,
          passwordResetExpires: {
            gt: new Date(), // Token hasn't expired
          },
        },
      });

      if (!user) {
        throw new Error("Invalid or expired reset token");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          loginAttempts: 0, // Reset login attempts
          lockUntil: null, // Unlock account if locked
        },
      });

      return { success: true };
    } catch (error) {
      throw new Error("Failed to reset password");
    }
  }

  // ============================================
  // WebAuthn / Passkey Methods
  // ============================================

  static async generateWebAuthnRegistrationOptions(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const existingCredentials = await prisma.webAuthnCredential.findMany({
      where: { userId },
      select: { credentialId: true },
    });

    const options = await generateRegistrationOptions({
      rpName: process.env.RP_NAME || "YourDrive",
      rpID: process.env.RP_ID || "localhost",
      userID: Uint8Array.from(Buffer.from(userId, "utf-8")),
      userName: user.email,
      attestationType: "none",
      excludeCredentials: existingCredentials.map((cred: { credentialId: string }) => ({
        id: cred.credentialId,
        transports: ["internal", "hybrid"] as AuthenticatorTransportFuture[],
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    return options;
  }

  static async verifyWebAuthnRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    deviceName?: string,
  ): Promise<{ verified: boolean }> {
    // Get expected challenge from the response
    const expectedChallenge = response.response.clientDataJSON
      ? Buffer.from(response.response.clientDataJSON, "base64").toString()
      : "";

    const verification: VerifiedRegistrationResponse =
      await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: process.env.FRONTEND_URL || "http://localhost:5173",
        expectedRPID: process.env.RP_ID || "localhost",
      });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("WebAuthn verification failed");
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    await prisma.webAuthnCredential.create({
      data: {
        userId,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64"),
        signCount: BigInt(credential.counter),
        deviceName: deviceName || "Unknown Device",
      },
    });

    return { verified: true };
  }

  static async generateWebAuthnAuthenticationOptions(userId?: string) {
    let allowCredentials:
      | Array<{
          id: string;
          transports?: AuthenticatorTransportFuture[];
        }>
      | undefined = undefined;

    if (userId) {
      const credentials = await prisma.webAuthnCredential.findMany({
        where: { userId },
        select: { credentialId: true },
      });

      allowCredentials = credentials.map((cred: { credentialId: string }) => ({
        id: cred.credentialId,
        transports: ["internal", "hybrid"] as AuthenticatorTransportFuture[],
      }));
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || "localhost",
      allowCredentials,
      userVerification: "preferred",
    });

    return options;
  }

  static async verifyWebAuthnAuthentication(
    response: AuthenticationResponseJSON,
  ): Promise<User> {
    const credentialId = response.id;

    const credential = await prisma.webAuthnCredential.findUnique({
      where: { credentialId },
      include: { user: true },
    });

    if (!credential) {
      throw new Error("Credential not found");
    }

    // Get expected challenge from the response
    const expectedChallenge = response.response.clientDataJSON
      ? Buffer.from(response.response.clientDataJSON, "base64").toString()
      : "";

    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: process.env.FRONTEND_URL || "http://localhost:5173",
        expectedRPID: process.env.RP_ID || "localhost",
        credential: {
          id: credential.credentialId,
          publicKey: Uint8Array.from(
            Buffer.from(credential.publicKey, "base64"),
          ),
          counter: Number(credential.signCount),
        },
      });

    if (!verification.verified) {
      throw new Error("WebAuthn authentication failed");
    }

    // Update counter and last used
    await prisma.webAuthnCredential.update({
      where: { id: credential.id },
      data: {
        signCount: BigInt(verification.authenticationInfo.newCounter),
        lastUsed: new Date(),
      },
    });

    return credential.user;
  }

  static async getUserPasskeys(userId: string) {
    return await prisma.webAuthnCredential.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        createdAt: true,
        lastUsed: true,
      },
    });
  }

  static async deletePasskey(
    userId: string,
    passkeyId: string,
  ): Promise<{ success: boolean }> {
    const passkey = await prisma.webAuthnCredential.findFirst({
      where: { id: passkeyId, userId },
    });

    if (!passkey) {
      throw new Error("Passkey not found");
    }

    await prisma.webAuthnCredential.delete({
      where: { id: passkeyId },
    });

    return { success: true };
  }

  // ============================================
  // OAuth / Social Login Methods
  // ============================================

  static async findOrCreateSocialUser(
    provider: string,
    providerUserId: string,
    email: string,
    profileData: SocialUserProfile,
  ): Promise<User> {
    // Check if social account exists
    const socialAccount = await prisma.socialAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      include: { user: true },
    });

    if (socialAccount) {
      return socialAccount.user;
    }

    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // Create new user if doesn't exist
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName:
            profileData.firstName ||
            profileData.name?.split(" ")[0] ||
            profileData.username ||
            "User",
          emailVerified: true, // Social logins are pre-verified
        },
      });
    }

    // Link social account
    await prisma.socialAccount.create({
      data: {
        userId: user.id,
        provider,
        providerUserId,
        email,
        profileData: profileData as any, // Prisma Json type
      },
    });

    return user;
  }

  static async unlinkSocialAccount(
    userId: string,
    provider: string,
  ): Promise<{ success: boolean }> {
    const socialAccount = await prisma.socialAccount.findFirst({
      where: { userId, provider },
    });

    if (!socialAccount) {
      throw new Error("Social account not found");
    }

    await prisma.socialAccount.delete({
      where: { id: socialAccount.id },
    });

    return { success: true };
  }

  static async getUserSocialAccounts(userId: string) {
    return await prisma.socialAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        email: true,
        createdAt: true,
      },
    });
  }
}