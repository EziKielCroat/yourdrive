import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

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
    console.log("Resetting schema...");
    await client.query(`DROP SCHEMA public CASCADE;`);
    await client.query(`CREATE SCHEMA public;`);

    console.log("Enabling extensions...");
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // ============================
    // USER
    // ============================

    await client.query(`
      CREATE TABLE "User" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        first_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "emailVerified" BOOLEAN DEFAULT false NOT NULL,
        email_verification_token TEXT,
        email_verification_expires TIMESTAMP,
        "loginAttempts" INT DEFAULT 0 NOT NULL,
        "lockUntil" TIMESTAMP,
        totp_secret TEXT,
        totp_enabled BOOLEAN DEFAULT false NOT NULL,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMP,
        password_reset_code_hash TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_user_email_verification_token ON "User"(email_verification_token);
    `);

    // ============================
    // SESSION
    // ============================

    await client.query(`
      CREATE TABLE "Session" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        "userId" TEXT NOT NULL,
        "refreshToken" TEXT UNIQUE NOT NULL,
        "deviceInfo" JSONB,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT session_user_fk
          FOREIGN KEY ("userId") REFERENCES "User"(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX session_user_idx ON "Session"("userId");
    `);

    // ============================
    // USER DEVICES
    // ============================

    await client.query(`
      CREATE TABLE user_devices (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        user_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        device_nickname TEXT,
        device_type TEXT NOT NULL,
        device_color VARCHAR(7) DEFAULT '#1a73e8' NOT NULL,
        browser TEXT,
        os TEXT,
        ip_address TEXT,
        user_agent TEXT,
        last_active TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        is_current BOOLEAN DEFAULT false NOT NULL,
        is_trusted BOOLEAN DEFAULT false NOT NULL,
        sync_enabled BOOLEAN DEFAULT true NOT NULL,
        storage_limit BIGINT,
        notifications_enabled BOOLEAN DEFAULT true NOT NULL,
        last_location TEXT,
        is_locked BOOLEAN DEFAULT false NOT NULL,
        lock_message TEXT,
        locked_at TIMESTAMP,
        wiped_at TIMESTAMP,
        force_logout BOOLEAN DEFAULT false NOT NULL,
        CONSTRAINT user_devices_user_fk
          FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX user_devices_user_idx ON user_devices(user_id);
      CREATE INDEX user_devices_active_idx ON user_devices(last_active);
    `);

    // ============================
    // USER FILES
    // ============================

    await client.query(`
      CREATE TABLE user_files (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_email TEXT NOT NULL,
        original_name TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        folder_path TEXT DEFAULT '' NOT NULL,
        size BIGINT NOT NULL,
        file_hash TEXT,
        mime_type TEXT NOT NULL,
        is_folder BOOLEAN DEFAULT false NOT NULL,
        is_locked BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMP,
        CONSTRAINT user_files_user_fk
          FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
        UNIQUE(user_id, folder_path, original_name)
      );

      CREATE INDEX user_files_user_idx ON user_files(user_id);
      CREATE INDEX user_files_folder_idx ON user_files(folder_path);
      CREATE INDEX user_files_deleted_idx ON user_files(deleted_at);
      CREATE INDEX user_files_updated_idx ON user_files(updated_at DESC);
      CREATE INDEX user_files_locked_idx ON user_files(is_locked) WHERE is_locked = true;
      CREATE INDEX user_files_folder_flag_idx ON user_files(is_folder) WHERE is_folder = true;
    `);

    // ============================
    // FAVORITED FILES
    // ============================

    await client.query(`
      CREATE TABLE favorited_files (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_id INTEGER NOT NULL,
        favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT favorited_user_fk
          FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
        CONSTRAINT favorited_file_fk
          FOREIGN KEY (file_id) REFERENCES user_files(id) ON DELETE CASCADE,
        UNIQUE(user_id, file_id)
      );

      CREATE INDEX favorited_user_idx ON favorited_files(user_id);
      CREATE INDEX favorited_file_idx ON favorited_files(file_id);
    `);

    // ============================
    // FILE SHARES (public sharing links)
    // ============================

    await client.query(`
      CREATE TABLE file_shares (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        file_id INTEGER NOT NULL,
        owner_id TEXT NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        share_type TEXT NOT NULL,
        permission TEXT NOT NULL,
        password TEXT,
        expires_at TIMESTAMP,
        max_downloads INTEGER,
        download_count INTEGER DEFAULT 0 NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT file_shares_file_fk
          FOREIGN KEY (file_id) REFERENCES user_files(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT file_shares_owner_fk
          FOREIGN KEY (owner_id) REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE share_comments (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        share_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT share_comments_share_fk
          FOREIGN KEY (share_id) REFERENCES file_shares(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX share_comments_share_id_idx ON share_comments(share_id);
    `);

    await client.query(`
      CREATE TABLE share_activity (
        id SERIAL PRIMARY KEY,
        share_id TEXT NOT NULL,
        user_id TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT share_activity_share_fk
          FOREIGN KEY (share_id) REFERENCES file_shares(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT share_activity_user_fk
          FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE
      );
      CREATE INDEX share_activity_share_id_idx ON share_activity(share_id);
    `);

    // ============================
    // USER SETTINGS
    // ============================

    await client.query(`
      CREATE TABLE user_settings (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        profile JSONB DEFAULT '{}'::jsonb,
        security JSONB DEFAULT '{}'::jsonb,
        appearance JSONB DEFAULT '{}'::jsonb,
        language JSONB DEFAULT '{}'::jsonb,
        storage JSONB DEFAULT '{}'::jsonb,
        sharing JSONB DEFAULT '{}'::jsonb,
        preferences JSONB DEFAULT '{}'::jsonb,
        privacy JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        CONSTRAINT user_settings_user_fk
          FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION set_user_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION set_files_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_user_updated
        BEFORE UPDATE ON "User"
        FOR EACH ROW EXECUTE FUNCTION set_user_updated_at();

      CREATE TRIGGER trg_user_files_insert
        BEFORE INSERT ON user_files
        FOR EACH ROW EXECUTE FUNCTION set_files_updated_at();

      CREATE TRIGGER trg_user_files_update
        BEFORE UPDATE ON user_files
        FOR EACH ROW EXECUTE FUNCTION set_files_updated_at();

      CREATE OR REPLACE FUNCTION set_file_shares_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_file_shares_updated
        BEFORE UPDATE ON file_shares
        FOR EACH ROW EXECUTE FUNCTION set_file_shares_updated_at();
    `);

    // =====================================================
    // POST-MIGRATION FIXES
    // =====================================================

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_favorited_files_user_file
        ON favorited_files(user_id, file_id);

      CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_files_deleted_at ON user_files(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_user_files_is_locked ON user_files(is_locked);
      CREATE INDEX IF NOT EXISTS idx_user_files_folder_path ON user_files(folder_path);
      CREATE INDEX IF NOT EXISTS idx_user_files_mime_type ON user_files(mime_type);

      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_user_files_updated_at ON user_files;
      CREATE TRIGGER update_user_files_updated_at
        BEFORE UPDATE ON user_files
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      COMMENT ON TABLE favorited_files IS 'Stores user favorite/starred files';
      COMMENT ON COLUMN user_files.is_locked IS 'Prevents file modifications when true';
      COMMENT ON COLUMN user_files.deleted_at IS 'Soft delete timestamp for recycle bin functionality';
      COMMENT ON COLUMN user_files.updated_at IS 'Automatically updated on any modification';
    `);

    // ============================
    // RECYCLE BIN
    // ============================

    await client.query(`
  CREATE TABLE IF NOT EXISTS recycle_bin (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_id INTEGER NOT NULL,
    original_name TEXT NOT NULL,
    s3_key TEXT NOT NULL,
    user_email TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    folder_path TEXT DEFAULT '' NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT recycle_bin_user_fk
      FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,

    CONSTRAINT recycle_bin_file_fk
      FOREIGN KEY (file_id) REFERENCES user_files(id) ON DELETE CASCADE,

    UNIQUE(user_id, file_id)
  );

  CREATE INDEX IF NOT EXISTS idx_recycle_bin_user_id
    ON recycle_bin(user_id);

  CREATE INDEX IF NOT EXISTS idx_recycle_bin_deleted_at
    ON recycle_bin(deleted_at);

  CREATE INDEX IF NOT EXISTS idx_recycle_bin_file_id
    ON recycle_bin(file_id);
`);

    console.log("DATABASE INIT COMPLETE (WITH MIGRATION FIXES)");
  } catch (err) {
    console.error("DATABASE INIT FAILED", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase()
  .then(() => {
    console.log("Setup completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Setup failed:", err);
    process.exit(1);
  });
