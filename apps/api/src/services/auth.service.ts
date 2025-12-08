import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
  name: z.string().min(2).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const validated = registerSchema.parse(data);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(validated.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const validated = loginSchema.parse(data);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
    }

    const isValid = await bcrypt.compare(validated.password, user.password);

    if (!isValid) {
      await this.handleFailedLogin(user.id);
      throw new Error("Invalid email or password");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null },
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  private static async handleFailedLogin(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const attempts = user.loginAttempts + 1;
    const lockUntil =
      attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: attempts, lockUntil },
    });
  }

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

  static verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET) as {
        userId: string;
        type: string;
      };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
    };

    const sessions = await prisma.session.findMany({
      where: {
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
    });

    let validSession = null;
    for (const session of sessions) {
      const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
      if (isValid) {
        validSession = session;
        break;
      }
    }

    if (!validSession) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = this.generateAccessToken(decoded.userId);

    return { accessToken };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async logout(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: string;
      };

      await prisma.session.deleteMany({
        where: { userId: decoded.userId },
      });
    } catch (error) {
      // Token invalid, ignore
    }
  }
}
