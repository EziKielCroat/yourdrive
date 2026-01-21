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

async function setupCoreTables(client) {
  console.log("Dropping schema...");
  await client.query(`DROP SCHEMA public CASCADE;`);
  await client.query(`CREATE SCHEMA public;`);

  console.log("Creating User table...");
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

  console.log("Creating Session table...");
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

  await client.query(
    `CREATE INDEX "Session_userId_idx" ON "Session"("userId");`,
  );

  console.log("Creating Devices table...");
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

  await client.query(
    `CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);`,
  );
  await client.query(
    `CREATE INDEX idx_user_devices_last_active ON user_devices(last_active);`,
  );

  console.log("Creating File table...");
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

  await client.query(`CREATE INDEX "File_userId_idx" ON "File"("userId");`);

  console.log("Creating user_files table...");
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
      deleted_at TIMESTAMP NULL,
      CONSTRAINT user_files_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES "User"(id) ON DELETE CASCADE
    );
  `);

  await client.query(
    `CREATE INDEX idx_user_files_user_id ON user_files(user_id);`,
  );
  await client.query(
    `CREATE INDEX idx_user_files_folder_path ON user_files(folder_path);`,
  );

  await client.query(
    `CREATE INDEX idx_user_files_deleted_at ON user_files(deleted_at);`,
  );

  console.log("Creating user_settings table...");
  await client.query(`
    CREATE TABLE user_settings (
      id SERIAL PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,

      profile JSONB DEFAULT '{"email": "", "firstName": "", "lastName": "", "avatarUrl": null}'::jsonb,
      security JSONB DEFAULT '{"twoFactorEnabled": false, "clientSideEncryption": false, "offlineModeEnabled": false}'::jsonb,
      appearance JSONB DEFAULT '{"theme": "system", "fileView": "grid", "thumbnailQuality": "medium"}'::jsonb,
      language JSONB DEFAULT '{"displayLanguage": "en", "dateFormat": "MM/DD/YYYY", "timeFormat": "12-hour", "timezone": "UTC"}'::jsonb,
      storage JSONB DEFAULT '{"autoSync": true, "fileVersioning": true, "maxVersionsToKeep": 10}'::jsonb,
      sharing JSONB DEFAULT '{"defaultLinkPermission": "view", "allowPublicSharing": true, "requirePasswordForLinks": false, "linkExpirationDays": null, "notifyOnShare": true, "allowDownload": true}'::jsonb,
      preferences JSONB DEFAULT '{"emailNotifications": true, "desktopNotifications": false, "notifyOnUpload": true, "notifyOnShare": true, "notifyOnComment": true, "weeklyDigest": false}'::jsonb,
      privacy JSONB DEFAULT '{"showOnlineStatus": true, "allowActivityTracking": true, "shareUsageData": false, "indexFilesForSearch": true}'::jsonb,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES "User"(id) ON DELETE CASCADE
    );
  `);

  await client.query(
    `CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);`,
  );

  console.log("Creating linked_accounts table...");
  await client.query(`
    CREATE TABLE linked_accounts (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider VARCHAR(50) NOT NULL,
      provider_user_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      CONSTRAINT linked_accounts_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES "User"(id) ON DELETE CASCADE,
      UNIQUE(user_id, provider)
    );
  `);

  await client.query(
    `CREATE INDEX idx_linked_accounts_user_id ON linked_accounts(user_id);`,
  );
  await client.query(
    `CREATE INDEX idx_linked_accounts_provider ON linked_accounts(provider);`,
  );

  console.log("Creating update trigger function...");
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.query(`
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON user_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function setupFavoriteTables(client) {
  console.log("Creating favorited_files table...");

  await client.query(`
    CREATE TABLE favorited_files (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      file_id INTEGER NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, file_id)
    );
  `);

  await client.query(`
    CREATE INDEX idx_favorited_files_user ON favorited_files(user_id);
  `);

  await client.query(`
    CREATE INDEX idx_favorited_files_file ON favorited_files(file_id);
  `);
}

async function setupSharingTables(client) {
  console.log("Creating file_shares table...");
  await client.query(`
    CREATE TABLE file_shares (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      file_id INTEGER NOT NULL,
      owner_id TEXT NOT NULL,
      share_token TEXT UNIQUE NOT NULL,
      share_type VARCHAR(20) NOT NULL CHECK (share_type IN ('link', 'email', 'internal')),
      permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'comment', 'edit', 'download')),
      password TEXT,
      expires_at TIMESTAMP,
      max_downloads INTEGER,
      download_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),

      CONSTRAINT file_shares_file_id_fkey FOREIGN KEY (file_id)
        REFERENCES user_files(id) ON DELETE CASCADE,

      CONSTRAINT file_shares_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES "User"(id) ON DELETE CASCADE
    );
  `);

  await client.query(`
    CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
    CREATE INDEX idx_file_shares_owner_id ON file_shares(owner_id);
    CREATE INDEX idx_file_shares_token ON file_shares(share_token);
    CREATE INDEX idx_file_shares_active ON file_shares(is_active) WHERE is_active = true;
  `);

  console.log("Creating share_recipients...");
  await client.query(`
    CREATE TABLE share_recipients (
      id SERIAL PRIMARY KEY,
      share_id TEXT NOT NULL,
      recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('user', 'email', 'anyone')),
      recipient_user_id TEXT,
      recipient_email TEXT,
      permission VARCHAR(20) NOT NULL CHECK (permission IN ('view', 'comment', 'edit', 'download')),
      notified BOOLEAN DEFAULT false,
      last_accessed TIMESTAMP,
      access_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT share_recipients_share_id_fkey FOREIGN KEY (share_id)
        REFERENCES file_shares(id) ON DELETE CASCADE,
      CONSTRAINT share_recipients_recipient_user_id_fkey FOREIGN KEY (recipient_user_id)
        REFERENCES "User"(id) ON DELETE CASCADE
    );
  `);

  await client.query(`
    CREATE INDEX idx_share_recipients_share_id ON share_recipients(share_id);
    CREATE INDEX idx_share_recipients_user_id ON share_recipients(recipient_user_id);
    CREATE INDEX idx_share_recipients_email ON share_recipients(recipient_email);
  `);

  console.log("Creating share_activity...");
  await client.query(`
    CREATE TABLE share_activity (
      id SERIAL PRIMARY KEY,
      share_id TEXT NOT NULL,
      user_id TEXT,
      action VARCHAR(50) NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT share_activity_share_id_fkey FOREIGN KEY (share_id)
        REFERENCES file_shares(id) ON DELETE CASCADE,
      CONSTRAINT share_activity_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES "User"(id) ON DELETE SET NULL
    );
  `);

  await client.query(`
    CREATE INDEX idx_share_activity_share_id ON share_activity(share_id);
    CREATE INDEX idx_share_activity_created_at ON share_activity(created_at DESC);
  `);

  console.log("Creating file_shares updated_at trigger...");
  await client.query(`
    CREATE TRIGGER update_file_shares_updated_at
      BEFORE UPDATE ON file_shares
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

async function setupRecycleBinTables(client) {
  console.log("Creating recycle_bin table...");

  await client.query(`
    CREATE TABLE recycle_bin (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      file_id INTEGER NOT NULL,
      original_name TEXT NOT NULL,
      s3_key TEXT NOT NULL,
      user_email TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size BIGINT NOT NULL,
      folder_path TEXT DEFAULT '',
      deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, file_id)
    );
  `);

  await client.query(`
    CREATE INDEX idx_recycle_bin_user_id ON recycle_bin(user_id);
  `);

  await client.query(`
    CREATE INDEX idx_recycle_bin_deleted_at ON recycle_bin(deleted_at DESC);
  `);

  await client.query(`
    CREATE INDEX idx_recycle_bin_file_id ON recycle_bin(file_id);
  `);

  console.log(
    "✓ Recycle bin table created WITHOUT CASCADE constraint on file_id",
  );
}

async function setupFileActivityTable(client) {
  console.log("Creating file_activity table...");

  await client.query(`
    CREATE TABLE file_activity (
      id SERIAL PRIMARY KEY,
      file_id INTEGER NOT NULL REFERENCES user_files(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('created', 'edited', 'viewed', 'downloaded', 'renamed', 'moved', 'shared')),
      created_at TIMESTAMP DEFAULT NOW(),
      metadata JSONB DEFAULT '{}'::jsonb
    );
  `);

  await client.query(`
    CREATE INDEX idx_file_activity_file_id ON file_activity(file_id);
    CREATE INDEX idx_file_activity_user_id ON file_activity(user_id);
    CREATE INDEX idx_file_activity_created_at ON file_activity(created_at DESC);
    CREATE INDEX idx_file_activity_type ON file_activity(activity_type);
  `);

  await client.query(`
    ALTER TABLE user_files 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION update_user_files_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_user_files_updated_at
      BEFORE UPDATE ON user_files
      FOR EACH ROW
      EXECUTE FUNCTION update_user_files_updated_at();
  `);
}

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log("Connected to database...\n");

    await setupCoreTables(client);
    await setupFavoriteTables(client);
    await setupSharingTables(client);
    await setupRecycleBinTables(client);
    await setupFileActivityTable(client);

    console.log("\n✅ ALL TABLES CREATED SUCCESSFULLY!");
    console.log(
      "✅ Recycle bin is now independent - deleted files will persist!",
    );
  } catch (err) {
    console.error("❌ Database setup failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
