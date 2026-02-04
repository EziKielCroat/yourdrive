import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import filesRoutes from "./routes/files.routes";
import settingsRoutes from "./routes/settings.routes";
import sharingRoutes from "./routes/sharing.routes";
import devicesRoutes from "./routes/devices.routes";
import conversionRoutes from "./routes/conversion.routes";
import fileActionsRoutes from "./routes/fileActions.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["ETag"],
  }),
);
app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/sharing", sharingRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/conversion", conversionRoutes);
app.use("/api/file-actions", fileActionsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "API is healthy" });
});

app.get("/api/version", (req, res) => {
  res.json({ version: "1.10" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  },
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

const server = app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});

export default app;
