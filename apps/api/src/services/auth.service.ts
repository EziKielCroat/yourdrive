import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode";
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

    const isSkoleUser = validated.email.toLowerCase().endsWith("@skole.hr");

    const BASE_STORAGE = 50n * 1024n * 1024n * 1024n; // 50GB
    const SKOLE_BONUS = 100n * 1024n * 1024n * 1024n; // 100GB

    const totalStorage = isSkoleUser
      ? BASE_STORAGE + SKOLE_BONUS
      : BASE_STORAGE;

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: validated.email,
          password: hashedPassword,
          firstName: validated.firstName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          emailVerified: true,
        },
      });

      await tx.userSettings.create({
        data: {
          userId: createdUser.id,
        },
      });

      await tx.userDevice.create({
        data: {
          userId: createdUser.id,
          deviceName: "Primary Device",
          deviceType: "web",
          storageLimit: totalStorage,
          isCurrent: true,
        },
      });

      return createdUser;
    });

    return {
      ...user,
      storageTier: isSkoleUser ? "150GB (school bonus)" : "50GB (free tier)",
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
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true },
    });

    if (!user?.totpSecret) {
      throw new Error("TOTP not set up");
    }

    const isValid = authenticator.verify({
      token,
      secret: user.totpSecret,
    });

    if (!isValid) {
      throw new Error("Invalid TOTP code");
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
      excludeCredentials: existingCredentials.map((cred) => ({
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

      allowCredentials = credentials.map((cred) => ({
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
