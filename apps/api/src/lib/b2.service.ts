import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import crypto from "crypto";

interface B2Config {
  region: string;
  endpoint?: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucketName: string;
}

// todo actually employ in the routes

export class B2Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    const config: B2Config = {
      region: process.env.AWS_REGION || process.env.B2_REGION || "us-east-1",
      credentials: {
        accessKeyId:
          process.env.AWS_ACCESS_KEY_ID || process.env.B2_KEY_ID || "",
        secretAccessKey:
          process.env.AWS_SECRET_ACCESS_KEY ||
          process.env.B2_APPLICATION_KEY ||
          "",
      },
      bucketName:
        process.env.AWS_BUCKET_NAME || process.env.B2_BUCKET_NAME || "",
    };

    if (process.env.B2_ENDPOINT || process.env.S3_ENDPOINT) {
      config.endpoint = process.env.B2_ENDPOINT || process.env.S3_ENDPOINT;
    }

    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
      forcePathStyle: !!config.endpoint, // Required for B2 and some S3-compatible services
    });

    this.bucketName = config.bucketName;

    if (!this.bucketName) {
      throw new Error(
        "Bucket name is required. Set AWS_BUCKET_NAME or B2_BUCKET_NAME in .env",
      );
    }
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<{ key: string; etag?: string }> {
    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          Metadata: metadata,
        },
      });

      const result = await upload.done();

      return {
        key,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async uploadFileWithProgress(
    buffer: Buffer,
    key: string,
    mimeType: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ key: string; etag?: string }> {
    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        },
        queueSize: 4, // Number of concurrent uploads
        partSize: 5 * 1024 * 1024, // 5MB parts
      });

      if (onProgress) {
        upload.on("httpUploadProgress", (progress) => {
          if (progress.loaded && progress.total) {
            const percentage = Math.round(
              (progress.loaded / progress.total) * 100,
            );
            onProgress(percentage);
          }
        });
      }

      const result = await upload.done();

      return {
        key,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("S3 upload with progress error:", error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error("Get signed URL error:", error);
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  async getSignedDownloadUrl(
    key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    return this.getSignedUrl(key, expiresIn);
  }

  async getSignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimeType,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error("Get signed upload URL error:", error);
      throw new Error(`Failed to generate upload URL: ${error}`);
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error("No file body returned");
      }

      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error("S3 download error:", error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("S3 delete error:", error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.deleteFile(key)));
    } catch (error) {
      console.error("S3 bulk delete error:", error);
      throw new Error(`Failed to delete files: ${error}`);
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  async getFileMetadata(key: string): Promise<{
    size: number;
    contentType: string;
    lastModified?: Date;
    etag?: string;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);

      return {
        size: response.ContentLength || 0,
        contentType: response.ContentType || "application/octet-stream",
        lastModified: response.LastModified,
        etag: response.ETag,
      };
    } catch (error) {
      console.error("Get file metadata error:", error);
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  async copyFile(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("S3 copy error:", error);
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  generateFileKey(
    userId: string,
    originalFileName: string,
    folderPath?: string,
  ): string {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString("hex");
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    const basePath = folderPath ? `${folderPath}/` : "";
    return `files/${userId}/${basePath}${timestamp}-${randomHash}-${sanitizedFileName}`;
  }

  calculateFileHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  getBucketName(): string {
    return this.bucketName;
  }

  async streamFile(key: string): Promise<NodeJS.ReadableStream> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error("No file body returned");
      }

      return response.Body as any;
    } catch (error) {
      console.error("S3 stream error:", error);
      throw new Error(`Failed to stream file: ${error}`);
    }
  }

  async uploadStream(
    stream: NodeJS.ReadableStream,
    key: string,
    mimeType: string,
  ): Promise<{ key: string; etag?: string }> {
    try {
      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: stream,
          ContentType: mimeType,
        },
      });

      const result = await upload.done();

      return {
        key,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("S3 stream upload error:", error);
      throw new Error(`Failed to upload stream: ${error}`);
    }
  }
}

export const b2Service = new B2Service();
