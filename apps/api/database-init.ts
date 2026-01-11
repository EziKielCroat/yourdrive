import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("Connected to database");
    console.log("Dropping existing schema...");
    await client.query(`DROP SCHEMA public CASCADE;`);
    await client.query(`CREATE SCHEMA public;`);
    console.log("Schema reset complete");

    console.log("\nCreating User table...");
    await client.query(`
      CREATE TABLE "User" (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "emailVerified" BOOLEAN DEFAULT false NOT NULL,
        "loginAttempts" INTEGER DEFAULT 0 NOT NULL,
        "lockUntil" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("User table created");

    console.log("\n Creating Session table...");
    await client.query(`
      CREATE TABLE "Session" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "refreshToken" TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX "Session_userId_idx" ON "Session"("userId");
    `);
    console.log("Session table created");

    console.log("\nCreating Devices table...");
    await client.query(`
      CREATE TABLE user_devices (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        device_type TEXT NOT NULL,
        browser TEXT,
        os TEXT,
        ip_address TEXT,
        user_agent TEXT,
        last_active TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        is_current BOOLEAN DEFAULT false,
        CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES "User"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
    `);
    await client.query(`
      CREATE INDEX idx_user_devices_last_active ON user_devices(last_active);
    `);
    console.log("Devices table created");

    console.log("\nCreating File table...");
    await client.query(`
      CREATE TABLE "File" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER NOT NULL,
        "mimeType" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX "File_userId_idx" ON "File"("userId");
    `);
    console.log("File table created");

    console.log("\nCreating user_files table...");
    await client.query(`
      CREATE TABLE user_files (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        original_name TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        folder_path TEXT DEFAULT '',
        size BIGINT NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT user_files_user_id_fkey FOREIGN KEY (user_id) 
          REFERENCES "User"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX idx_user_files_user_id ON user_files(user_id);
    `);
    await client.query(`
      CREATE INDEX idx_user_files_folder_path ON user_files(folder_path);
    `);
    console.log("user_files table created");

    console.log("\n Verifying tables...");
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log("\n Tables created:");
    result.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    console.log("\n Database setup complete!");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

console.log(" Checking environment variables...");
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}
console.log("DATABASE_URL found");

setupDatabase()
  .then(() => {
    console.log("Done! You can now start your server.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Setup failed:", err);
    process.exit(1);
  });
