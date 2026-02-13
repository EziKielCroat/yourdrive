export interface UserSettings {
  // Account Information
  profile: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    avatarInitials: string;
  };

  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    clientSideEncryption: boolean;
    offlineModeEnabled: boolean;
    passwordLastChanged?: Date;
    activeSessions: ActiveSession[];
  };

  // Appearance Settings
  appearance: {
    theme: "light" | "dark" | "system";
    fileView: "grid" | "list" | "compact";
    thumbnailQuality: "high" | "medium" | "low";
    accentColor?: string;
  };

  // Language & Region Settings
  language: {
    displayLanguage: string;
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    timeFormat: "12-hour" | "24-hour";
    timezone: string;
  };

  // Storage Settings
  storage: {
    totalStorage: number; // in bytes
    usedStorage: number; // in bytes
    autoSync: boolean;
    fileVersioning: boolean;
    maxVersionsToKeep: number;
    cacheSize: number; // in bytes
  };

  // Sharing & Collaboration Settings
  sharing: {
    defaultLinkPermission: "view" | "edit" | "comment";
    allowPublicSharing: boolean;
    requirePasswordForLinks: boolean;
    linkExpirationDays: number | null;
    notifyOnShare: boolean;
    allowDownload: boolean;
    defaultPassword?: string;
    defaultExpirationDays?: number | null;
    defaultDownloadLimit?: number | null;
  };

  // Linked Accounts
  linkedAccounts: LinkedAccount[];

  // Preferences
  preferences: {
    emailNotifications: boolean;
    desktopNotifications: boolean;
    pushNotifications: boolean;
    notifyOnUpload: boolean;
    notifyOnShare: boolean;
    notifyOnComment: boolean;
    notifyOnMention: boolean;
    weeklyDigest: boolean;
  };

  // Privacy Settings
  privacy: {
    showOnlineStatus: boolean;
    allowActivityTracking: boolean;
    shareUsageData: boolean;
    indexFilesForSearch: boolean;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkedAccount {
  id: string;
  provider: "google" | "microsoft" | "dropbox" | "apple";
  email: string;
  linkedAt: Date;
  isActive: boolean;
}

export interface ActiveSession {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet" | "web";
  deviceName: string;
  browser?: string;
  os?: string;
  location?: string;
  ipAddress: string;
  lastActive: Date;
  isCurrent: boolean;
}

// API Request Types
export interface UpdateProfileRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface UpdateSecurityRequest {
  twoFactorEnabled?: boolean;
  clientSideEncryption?: boolean;
  offlineModeEnabled?: boolean;
}

export interface UpdateAppearanceRequest {
  theme?: "light" | "dark" | "system";
  fileView?: "grid" | "list" | "compact";
  thumbnailQuality?: "high" | "medium" | "low";
}

export interface UpdateLanguageRequest {
  displayLanguage?: string;
  dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat?: "12-hour" | "24-hour";
  timezone?: string;
}

export interface UpdateStorageRequest {
  autoSync?: boolean;
  fileVersioning?: boolean;
  maxVersionsToKeep?: number;
}

export interface UpdateSharingRequest {
  defaultLinkPermission?: "view" | "edit" | "comment";
  allowPublicSharing?: boolean;
  requirePasswordForLinks?: boolean;
  linkExpirationDays?: number | null;
  notifyOnShare?: boolean;
  allowDownload?: boolean;
  defaultPassword?: string;
  defaultExpirationDays?: number | null;
  defaultDownloadLimit?: number | null;
}

export interface SharingDefaultsResponse {
  requirePasswordForLinks: boolean;
  defaultPassword: string;
  defaultExpirationDays: number | null;
  defaultDownloadLimit: number | null;
  [key: string]: unknown;
}

export interface UpdatePreferencesRequest {
  emailNotifications?: boolean;
  desktopNotifications?: boolean;
  pushNotifications?: boolean;
  notifyOnUpload?: boolean;
  notifyOnShare?: boolean;
  notifyOnComment?: boolean;
  notifyOnMention?: boolean;
  weeklyDigest?: boolean;
}

export interface UpdatePrivacyRequest {
  showOnlineStatus?: boolean;
  allowActivityTracking?: boolean;
  shareUsageData?: boolean;
  indexFilesForSearch?: boolean;
}

// Database Schema (MongoDB/PostgreSQL)
export const SettingsSchema = {
  tableName: "user_settings",
  fields: {
    userId: "string (foreign key to users table)",
    profile: "jsonb",
    security: "jsonb",
    appearance: "jsonb",
    language: "jsonb",
    storage: "jsonb",
    sharing: "jsonb",
    preferences: "jsonb",
    privacy: "jsonb",
    createdAt: "timestamp",
    updatedAt: "timestamp",
  },
  indexes: ["userId (unique)", "updatedAt"],
};

export const LinkedAccountsSchema = {
  tableName: "linked_accounts",
  fields: {
    id: "uuid (primary key)",
    userId: "string (foreign key to users table)",
    provider: "enum",
    email: "string",
    providerUserId: "string",
    accessToken: "encrypted string",
    refreshToken: "encrypted string",
    linkedAt: "timestamp",
    isActive: "boolean",
  },
  indexes: ["userId", "provider", "userId, provider (unique composite)"],
};

export const ActiveSessionsSchema = {
  tableName: "active_sessions",
  fields: {
    id: "uuid (primary key)",
    userId: "string (foreign key to users table)",
    deviceType: "enum",
    deviceName: "string",
    browser: "string",
    os: "string",
    location: "string",
    ipAddress: "string",
    sessionToken: "encrypted string",
    lastActive: "timestamp",
    createdAt: "timestamp",
  },
  indexes: ["userId", "sessionToken (unique)", "lastActive"],
};

// Default Settings
export const defaultSettings: Partial<UserSettings> = {
  appearance: {
    theme: "system",
    fileView: "grid",
    thumbnailQuality: "medium",
  },
  language: {
    displayLanguage: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12-hour",
    timezone: "UTC",
  },
  storage: {
    totalStorage: 10 * 1024 * 1024 * 1024, // 10GB
    usedStorage: 0,
    autoSync: true,
    fileVersioning: true,
    maxVersionsToKeep: 10,
    cacheSize: 0,
  },
  sharing: {
    defaultLinkPermission: "view",
    allowPublicSharing: true,
    requirePasswordForLinks: false,
    linkExpirationDays: null,
    notifyOnShare: true,
    allowDownload: true,
  },
  preferences: {
    emailNotifications: true,
    desktopNotifications: false,
    pushNotifications: false,
    notifyOnUpload: true,
    notifyOnShare: true,
    notifyOnComment: true,
    notifyOnMention: true,
    weeklyDigest: false,
  },
  privacy: {
    showOnlineStatus: true,
    allowActivityTracking: true,
    shareUsageData: false,
    indexFilesForSearch: true,
  },
  security: {
    twoFactorEnabled: false,
    clientSideEncryption: false,
    offlineModeEnabled: false,
    activeSessions: [],
  },
  linkedAccounts: [],
};
