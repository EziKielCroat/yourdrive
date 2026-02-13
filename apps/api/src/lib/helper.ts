import { s3Client } from "../routes/files.routes";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner/";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

export async function trackFileActivity(
  fileId: number,
  userId: string,
  activityType: string,
  metadata: object = {},
  pool: any,
) {
  await pool.query(
    `INSERT INTO file_activity (file_id, user_id, activity_type, metadata)
     VALUES ($1, $2, $3, $4)`,
    [fileId, userId, activityType, JSON.stringify(metadata)],
  );
}

export async function logDeviceAction(
  deviceId: string,
  userId: string,
  action: string,
  details: any,
  req: any,
  pool: any,
) {
  await pool.query(
    `INSERT INTO device_activity_audit (device_id, user_id, action, details, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      deviceId,
      userId,
      action,
      JSON.stringify(details),
      req.ip || req.headers["x-forwarded-for"],
      req.headers["user-agent"],
    ],
  );
}

export async function generateSignedUrl(
  s3Key: string,
  expiresIn: number = 3600,
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || process.env.B2_BUCKET_NAME || "",
      Key: s3Key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate file access URL");
  }
}

export async function uploadToS3(
  s3Key: string,
  content: string,
  mimeType: string,
): Promise<void> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || process.env.B2_BUCKET_NAME || "",
      Key: s3Key,
      Body: Buffer.from(content, "utf-8"),
      ContentType: mimeType,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file content");
  }
}
