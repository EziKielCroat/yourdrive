import express, { Request, Response } from "express";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { b2Service } from "../lib/b2.service";
import { prisma } from "../lib/prisma";
import axios from "axios";
import crypto from "crypto";

const conversionRoutes = express.Router();

conversionRoutes.get(
  "/prepare/:fileId",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { fileId } = req.params;
      const userId = req.userId!;

      const file = await prisma.userFile.findFirst({
        where: { id: parseInt(fileId, 10), userId },
      });

      if (!file) {
        return res
          .status(404)
          .json({ success: false, error: "File not found" });
      }

      const downloadUrl = await b2Service.getSignedDownloadUrl(
        file.s3Key,
        3600,
      );

      return res.json({
        success: true,
        downloadUrl,
        fileName: file.originalName,
        mimeType: file.mimeType,
        fileId: file.id,
      });
    } catch (err) {
      console.error("Prepare file error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to prepare file" });
    }
  },
);

conversionRoutes.post(
  "/save",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { originalFileId, convertedFileUrl, fileName, newFormat } =
        req.body;
      const userId = req.userId!;

      if (!originalFileId || !convertedFileUrl || !fileName || !newFormat) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      const response = await axios.get<ArrayBuffer>(convertedFileUrl, {
        responseType: "arraybuffer",
      });

      const buffer = Buffer.from(response.data);

      const s3Key = b2Service.generateFileKey(userId, fileName, "converted");

      await b2Service.uploadFile(
        buffer,
        s3Key,
        response.headers["content-type"] || `application/${newFormat}`,
      );

      const convertedFile = await prisma.userFile.create({
        data: {
          userId,
          userEmail: "",
          originalName: fileName,
          s3Key,
          folderPath: "converted",
          size: BigInt(buffer.length),
          mimeType:
            response.headers["content-type"] || `application/${newFormat}`,
          fileHash: crypto.createHash("sha256").update(buffer).digest("hex"),
        },
      });

      return res.json({ success: true, file: convertedFile });
    } catch (err) {
      console.error("Save conversion error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Failed to save converted file" });
    }
  },
);

export default conversionRoutes;
