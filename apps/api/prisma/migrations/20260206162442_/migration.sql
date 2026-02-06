-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "email_verification_expires" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "password_reset_code_hash" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "deviceInfo" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "device_nickname" TEXT,
    "device_type" TEXT NOT NULL,
    "device_color" TEXT NOT NULL DEFAULT '#1a73e8',
    "browser" TEXT,
    "os" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "is_trusted" BOOLEAN NOT NULL DEFAULT false,
    "sync_enabled" BOOLEAN NOT NULL DEFAULT true,
    "storage_limit" BIGINT,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_location" TEXT,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_message" TEXT,
    "locked_at" TIMESTAMP(3),
    "wiped_at" TIMESTAMP(3),
    "force_logout" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_files" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "folder_path" TEXT NOT NULL DEFAULT '',
    "size" BIGINT NOT NULL,
    "file_hash" TEXT,
    "mime_type" TEXT NOT NULL,
    "is_folder" BOOLEAN NOT NULL DEFAULT false,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorited_files" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" INTEGER NOT NULL,
    "favorited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorited_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "profile" JSONB NOT NULL DEFAULT '{"email": "", "avatarUrl": null, "firstName": ""}',
    "security" JSONB NOT NULL DEFAULT '{"twoFactorEnabled": false, "offlineModeEnabled": false, "clientSideEncryption": false}',
    "appearance" JSONB NOT NULL DEFAULT '{"theme": "system", "fileView": "grid", "thumbnailQuality": "medium"}',
    "language" JSONB NOT NULL DEFAULT '{"timezone": "UTC", "dateFormat": "MM/DD/YYYY", "timeFormat": "12-hour", "displayLanguage": "en"}',
    "storage" JSONB NOT NULL DEFAULT '{"autoSync": true, "fileVersioning": true, "maxVersionsToKeep": 10}',
    "sharing" JSONB NOT NULL DEFAULT '{"allowDownload": true, "notifyOnShare": true, "allowPublicSharing": true, "linkExpirationDays": null, "defaultLinkPermission": "view", "requirePasswordForLinks": false}',
    "preferences" JSONB NOT NULL DEFAULT '{"weeklyDigest": false, "notifyOnShare": true, "notifyOnUpload": true, "notifyOnComment": true, "emailNotifications": true, "desktopNotifications": false}',
    "privacy" JSONB NOT NULL DEFAULT '{"shareUsageData": false, "showOnlineStatus": true, "indexFilesForSearch": true, "allowActivityTracking": true}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webauthn_credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "sign_count" BIGINT NOT NULL DEFAULT 0,
    "device_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3),

    CONSTRAINT "webauthn_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "profile_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "totp_recovery_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "totp_recovery_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_shares" (
    "id" TEXT NOT NULL,
    "file_id" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "share_token" TEXT NOT NULL,
    "share_type" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "password" TEXT,
    "expires_at" TIMESTAMP(3),
    "max_downloads" INTEGER,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_comments" (
    "id" TEXT NOT NULL,
    "share_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_activity" (
    "id" SERIAL NOT NULL,
    "share_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recycle_bin" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "file_id" INTEGER NOT NULL,
    "original_name" TEXT NOT NULL,
    "s3_key" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "folder_path" TEXT NOT NULL DEFAULT '',
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userFileId" INTEGER,

    CONSTRAINT "recycle_bin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_verification_token_idx" ON "User"("email_verification_token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "user_devices_user_id_idx" ON "user_devices"("user_id");

-- CreateIndex
CREATE INDEX "user_devices_last_active_idx" ON "user_devices"("last_active");

-- CreateIndex
CREATE INDEX "user_files_user_id_idx" ON "user_files"("user_id");

-- CreateIndex
CREATE INDEX "user_files_folder_path_idx" ON "user_files"("folder_path");

-- CreateIndex
CREATE INDEX "user_files_deleted_at_idx" ON "user_files"("deleted_at");

-- CreateIndex
CREATE INDEX "user_files_updated_at_idx" ON "user_files"("updated_at");

-- CreateIndex
CREATE INDEX "user_files_is_locked_idx" ON "user_files"("is_locked");

-- CreateIndex
CREATE INDEX "user_files_is_folder_idx" ON "user_files"("is_folder");

-- CreateIndex
CREATE UNIQUE INDEX "user_files_user_id_folder_path_original_name_key" ON "user_files"("user_id", "folder_path", "original_name");

-- CreateIndex
CREATE INDEX "favorited_files_user_id_idx" ON "favorited_files"("user_id");

-- CreateIndex
CREATE INDEX "favorited_files_file_id_idx" ON "favorited_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorited_files_user_id_file_id_key" ON "favorited_files"("user_id", "file_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_credential_id_key" ON "webauthn_credentials"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_provider_provider_user_id_key" ON "social_accounts"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_shares_share_token_key" ON "file_shares"("share_token");

-- CreateIndex
CREATE INDEX "recycle_bin_user_id_idx" ON "recycle_bin"("user_id");

-- CreateIndex
CREATE INDEX "recycle_bin_file_id_idx" ON "recycle_bin"("file_id");

-- CreateIndex
CREATE INDEX "recycle_bin_deleted_at_idx" ON "recycle_bin"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "recycle_bin_user_id_file_id_key" ON "recycle_bin"("user_id", "file_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorited_files" ADD CONSTRAINT "favorited_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorited_files" ADD CONSTRAINT "favorited_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "user_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "totp_recovery_codes" ADD CONSTRAINT "totp_recovery_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "user_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_shares" ADD CONSTRAINT "file_shares_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_comments" ADD CONSTRAINT "share_comments_share_id_fkey" FOREIGN KEY ("share_id") REFERENCES "file_shares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_activity" ADD CONSTRAINT "share_activity_share_id_fkey" FOREIGN KEY ("share_id") REFERENCES "file_shares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_activity" ADD CONSTRAINT "share_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recycle_bin" ADD CONSTRAINT "recycle_bin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recycle_bin" ADD CONSTRAINT "recycle_bin_userFileId_fkey" FOREIGN KEY ("userFileId") REFERENCES "user_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
