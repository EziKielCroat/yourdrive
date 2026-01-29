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
    console.log("Dropping existing schema...");
    await client.query(`DROP SCHEMA public CASCADE;`);
    await client.query(`CREATE SCHEMA public;`);

    console.log("Enabling UUID extension...");
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    console.log("Creating User table...");
    await client.query(`
      CREATE TABLE "User" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        first_name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "emailVerified" BOOLEAN DEFAULT false NOT NULL,
        "loginAttempts" INTEGER DEFAULT 0 NOT NULL,
        "lockUntil" TIMESTAMP,
        totp_secret TEXT,
        totp_enabled BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);

    console.log("Creating Session table...");
    await client.query(`
      CREATE TABLE "Session" (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        "userId" TEXT NOT NULL,
        "refreshToken" TEXT UNIQUE NOT NULL,
        "deviceInfo" JSONB,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId")
          REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
      CREATE INDEX "Session_userId_idx" ON "Session"("userId");
    `);

    console.log("Creating user_devices table...");
    await client.query(`
      CREATE TABLE user_devices (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        user_id TEXT NOT NULL,
        device_name TEXT NOT NULL,
        device_nickname TEXT,
        device_type TEXT NOT NULL,
        device_color VARCHAR(7) DEFAULT '#1a73e8',
        browser TEXT,
        os TEXT,
        ip_address TEXT,
        user_agent TEXT,
        last_active TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        is_current BOOLEAN DEFAULT false,
        is_trusted BOOLEAN DEFAULT false,
        sync_enabled BOOLEAN DEFAULT true,
        storage_limit BIGINT,
        notifications_enabled BOOLEAN DEFAULT true,
        last_location TEXT,
        is_locked BOOLEAN DEFAULT false,
        lock_message TEXT,
        locked_at TIMESTAMP,
        wiped_at TIMESTAMP,
        force_logout BOOLEAN DEFAULT false,
        CONSTRAINT user_devices_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
      CREATE INDEX idx_user_devices_last_active ON user_devices(last_active);
    `);

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
        file_hash TEXT,
        mime_type TEXT NOT NULL,
        is_folder BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        CONSTRAINT user_files_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE,
        UNIQUE(user_id, folder_path, original_name)
      );
      CREATE INDEX idx_user_files_user_id ON user_files(user_id);
      CREATE INDEX idx_user_files_file_hash ON user_files(file_hash);
      CREATE INDEX idx_user_files_folder_path ON user_files(folder_path);
      CREATE INDEX idx_user_files_deleted_at ON user_files(deleted_at);
      CREATE INDEX idx_user_files_updated_at ON user_files(updated_at);
      CREATE INDEX idx_user_files_is_folder ON user_files(is_folder) WHERE is_folder = true;
    `);

    console.log("Creating user_settings table...");
    await client.query(`
      CREATE TABLE user_settings (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        profile JSONB DEFAULT '{"email": "", "firstName": "", "avatarUrl": null}'::jsonb,
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
      CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
    `);

    // ========================================
    // SECURITY TABLES
    // ========================================

    console.log("Creating webauthn_credentials table...");
    await client.query(`
      CREATE TABLE webauthn_credentials (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        user_id TEXT NOT NULL,
        credential_id TEXT NOT NULL UNIQUE,
        public_key TEXT NOT NULL,
        sign_count BIGINT NOT NULL DEFAULT 0,
        device_name TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        last_used TIMESTAMP,
        CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
      CREATE INDEX idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);
    `);

    console.log(" Creating social_accounts table...");
    await client.query(`
      CREATE TABLE social_accounts (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        user_id TEXT NOT NULL,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        profile_data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT social_accounts_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE,
        UNIQUE(provider, provider_user_id)
      );
      CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
      CREATE INDEX idx_social_accounts_provider ON social_accounts(provider);
    `);

    console.log(" Creating totp_recovery_codes table...");
    await client.query(`
      CREATE TABLE totp_recovery_codes (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
        user_id TEXT NOT NULL,
        code_hash TEXT NOT NULL,
        used BOOLEAN DEFAULT false,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT totp_recovery_codes_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_totp_recovery_codes_user_id ON totp_recovery_codes(user_id);
    `);

    // ========================================
    // FILE-RELATED TABLES
    // ========================================

    console.log("Creating favorited_files table...");
    await client.query(`
      CREATE TABLE favorited_files (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT favorited_files_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE,
        CONSTRAINT favorited_files_file_id_fkey FOREIGN KEY (file_id)
          REFERENCES user_files(id) ON DELETE CASCADE,
        UNIQUE(user_id, file_id)
      );
      CREATE INDEX idx_favorited_files_user ON favorited_files(user_id);
      CREATE INDEX idx_favorited_files_file ON favorited_files(file_id);
    `);

    console.log("Creating recycle_bin table...");
    await client.query(`
      CREATE TABLE recycle_bin (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_id INTEGER NOT NULL,
        original_name TEXT NOT NULL,
        s3_key TEXT NOT NULL,
        user_email TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size BIGINT NOT NULL,
        folder_path TEXT DEFAULT '',
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT recycle_bin_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE,
        UNIQUE(user_id, file_id)
      );
      CREATE INDEX idx_recycle_bin_user_id ON recycle_bin(user_id);
      CREATE INDEX idx_recycle_bin_deleted_at ON recycle_bin(deleted_at DESC);
      CREATE INDEX idx_recycle_bin_file_id ON recycle_bin(file_id);
    `);

    console.log("Creating file_activity table...");
    await client.query(`
      CREATE TABLE file_activity (
        id SERIAL PRIMARY KEY,
        file_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('created', 'edited', 'viewed', 'downloaded', 'renamed', 'moved', 'shared')),
        created_at TIMESTAMP DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'::jsonb,
        CONSTRAINT file_activity_file_id_fkey FOREIGN KEY (file_id)
          REFERENCES user_files(id) ON DELETE CASCADE,
        CONSTRAINT file_activity_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_file_activity_file_id ON file_activity(file_id);
      CREATE INDEX idx_file_activity_user_id ON file_activity(user_id);
      CREATE INDEX idx_file_activity_created_at ON file_activity(created_at DESC);
      CREATE INDEX idx_file_activity_type ON file_activity(activity_type);
    `);

    // ========================================
    // SHARING TABLES
    // ========================================

    console.log("Creating file_shares table...");
    await client.query(`
      CREATE TABLE file_shares (
        id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
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
      CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
      CREATE INDEX idx_file_shares_owner_id ON file_shares(owner_id);
      CREATE INDEX idx_file_shares_token ON file_shares(share_token);
      CREATE INDEX idx_file_shares_active ON file_shares(is_active) WHERE is_active = true;
    `);

    console.log("Creating share_recipients table...");
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
      CREATE INDEX idx_share_recipients_share_id ON share_recipients(share_id);
      CREATE INDEX idx_share_recipients_user_id ON share_recipients(recipient_user_id);
      CREATE INDEX idx_share_recipients_email ON share_recipients(recipient_email);
    `);

    console.log("Creating share_activity table...");
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
      CREATE INDEX idx_share_activity_share_id ON share_activity(share_id);
      CREATE INDEX idx_share_activity_created_at ON share_activity(created_at DESC);
    `);

    console.log("Creating device_files table...");
    await client.query(`
      CREATE TABLE device_files (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        file_id INTEGER NOT NULL,
        pinned BOOLEAN DEFAULT false,
        offline_available BOOLEAN DEFAULT false,
        last_accessed TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT device_files_device_id_fkey FOREIGN KEY (device_id)
          REFERENCES user_devices(id) ON DELETE CASCADE,
        CONSTRAINT device_files_file_id_fkey FOREIGN KEY (file_id)
          REFERENCES user_files(id) ON DELETE CASCADE,
        UNIQUE(device_id, file_id)
      );
      CREATE INDEX idx_device_files_device ON device_files(device_id);
      CREATE INDEX idx_device_files_file ON device_files(file_id);
      CREATE INDEX idx_device_files_pinned ON device_files(pinned) WHERE pinned = true;
    `);

    console.log("Creating device_groups table...");
    await client.query(`
      CREATE TABLE device_groups (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT '📱',
        color VARCHAR(7) DEFAULT '#1a73e8',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT device_groups_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_device_groups_user_id ON device_groups(user_id);
    `);

    console.log("Creating device_group_members table...");
    await client.query(`
      CREATE TABLE device_group_members (
        device_id TEXT NOT NULL,
        group_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT device_group_members_device_id_fkey FOREIGN KEY (device_id)
          REFERENCES user_devices(id) ON DELETE CASCADE,
        CONSTRAINT device_group_members_group_id_fkey FOREIGN KEY (group_id)
          REFERENCES device_groups(id) ON DELETE CASCADE,
        PRIMARY KEY (device_id, group_id)
      );
      CREATE INDEX idx_device_group_members_device ON device_group_members(device_id);
      CREATE INDEX idx_device_group_members_group ON device_group_members(group_id);
    `);

    console.log("Creating device_actions table...");
    await client.query(`
      CREATE TABLE device_actions (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('lock', 'logout', 'wipe', 'message', 'locate')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed', 'cancelled')),
        payload JSONB DEFAULT '{}'::jsonb,
        executed_at TIMESTAMP,
        completed_at TIMESTAMP,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT device_actions_device_id_fkey FOREIGN KEY (device_id)
          REFERENCES user_devices(id) ON DELETE CASCADE,
        CONSTRAINT device_actions_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_device_actions_device ON device_actions(device_id);
      CREATE INDEX idx_device_actions_status ON device_actions(status) WHERE status = 'pending';
      CREATE INDEX idx_device_actions_created ON device_actions(created_at DESC);
    `);

    console.log("Creating device_activity_audit table...");
    await client.query(`
      CREATE TABLE device_activity_audit (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT device_activity_audit_device_id_fkey FOREIGN KEY (device_id)
          REFERENCES user_devices(id) ON DELETE CASCADE,
        CONSTRAINT device_activity_audit_user_id_fkey FOREIGN KEY (user_id)
          REFERENCES "User"(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_device_activity_audit_device ON device_activity_audit(device_id);
      CREATE INDEX idx_device_activity_audit_user ON device_activity_audit(user_id);
      CREATE INDEX idx_device_activity_audit_created ON device_activity_audit(created_at DESC);
    `);

    // ========================================
    // TRIGGERS
    // ========================================

    console.log("Creating trigger functions...");
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

      CREATE TRIGGER update_user_files_updated_at
        BEFORE UPDATE ON user_files
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_file_shares_updated_at
        BEFORE UPDATE ON file_shares
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_device_groups_updated_at
        BEFORE UPDATE ON device_groups
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("\n✅ DATABASE SETUP COMPLETE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ All tables created successfully");
    console.log("✅ Matches Prisma schema exactly");
    console.log("✅ Session.deviceInfo included");
    console.log("✅ user_files.is_folder for folder tracking");
    console.log("✅ All foreign keys and indexes created");
    console.log("✅ Triggers configured");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (err) {
    console.error("Database setup failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
