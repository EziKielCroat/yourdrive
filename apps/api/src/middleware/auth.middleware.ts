import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyAccessToken(token);

    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
