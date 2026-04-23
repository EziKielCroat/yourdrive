export type HelpCategory =
  | "file-management"
  | "account-management"
  | "security"
  | "collaboration";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  category: HelpCategory;
  tags: string[];
  readTime: number;
  relatedIds: string[];
}

export interface Category {
  id: HelpCategory;
  label: string;
  description: string;
  articleCount: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "file-management",
    label: "File Management",
    description: "Upload, organise, preview and edit your files.",
    articleCount: 4,
  },
  {
    id: "account-management",
    label: "Account Management",
    description: "Profile settings, billing, devices and plans.",
    articleCount: 4,
  },
  {
    id: "security",
    label: "Security",
    description: "Encryption, two-factor auth and privacy controls.",
    articleCount: 3,
  },
  {
    id: "collaboration",
    label: "Collaboration",
    description: "Share files, set permissions and work with teams.",
    articleCount: 3,
  },
];

export const ARTICLES: Article[] = [
  // ── File Management ──────────────────────────────────────────
  {
    id: "fm-upload",
    title: "How to upload files to YourDrive",
    excerpt:
      "Learn the fastest ways to get your files into YourDrive — drag-and-drop, browser picker, or bulk folder upload.",
    content: `## Getting files into YourDrive

YourDrive supports multiple upload methods so you can choose whatever fits your workflow. Whether you're uploading a single document or thousands of files in a nested folder structure, the process is designed to be fast, reliable, and resumable.

### Method 1 — Drag and Drop

The quickest way to upload is to drag files directly from your desktop or file explorer into the dashboard.

1. Open your YourDrive dashboard.
2. Drag one or more files from your operating system into the browser window.
3. A **blue drop zone** appears to confirm the upload is accepted.
4. Release the files — the upload begins immediately and progress is tracked in the upload panel (bottom-right).

> TIP: You can drag a folder directly into the browser window. YourDrive will upload the entire folder hierarchy, preserving all sub-folders and file names.

### Method 2 — File Picker

If drag and drop is not convenient, use the file picker button instead.

1. Click the **Upload** button in the top-right toolbar of the dashboard.
2. Your operating system's native file picker opens.
3. Select one or multiple files — hold \`Ctrl\` (Windows) or \`Cmd\` (Mac) to select multiple files at once.
4. Click **Open** to begin the upload.

### Method 3 — Folder Upload

To upload an entire folder and preserve its directory structure:

1. Hold **Shift** and click the **Upload** button, or right-click inside the dashboard and select **Upload Folder**.
2. Select the folder you want to upload.
3. YourDrive uploads every file inside, recreating the complete folder tree on your drive.

> NOTE: Folder upload is available in Chrome, Edge, and Firefox. Safari currently supports only file-level upload via the picker.

### Upload size limits

| Plan | Max single file | Daily upload limit |
|------|----------------|-------------------|
| Free | 2 GB | 10 GB |
| Pro | 50 GB | Unlimited |
| Enterprise | Unlimited | Unlimited |

Files larger than **5 GB** automatically use multipart upload, which splits the file into chunks and uploads them in parallel. This improves reliability on slower connections and allows the upload to **resume automatically** if your connection drops.

### Supported file types

YourDrive accepts all file types without restriction — documents, images, videos, audio, archives, CAD files, code files, executables, and more. Files are stored as-is and are never modified or converted.

> WARNING: Uploading files that violate our Terms of Service (e.g. malware, pirated content) may result in account suspension. Review our Acceptable Use Policy for details.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "file-management",
    tags: ["upload", "drag-and-drop", "files"],
    readTime: 4,
    relatedIds: ["fm-share", "fm-organize", "fm-delete"],
  },
  {
    id: "fm-share",
    title: "How to share files and folders",
    excerpt:
      "Generate shareable links with custom permissions, expiration dates, and optional password protection.",
    content: `## Sharing files and folders

YourDrive makes it simple to share any file or folder with colleagues, clients, or the public — even with people who don't have a YourDrive account. Every share link is cryptographically unique and can be configured with fine-grained access controls.

### Creating a share link

1. In your dashboard, right-click any file or folder and select **Share** — or hover over it and click the share icon that appears in the action bar.
2. The **Share Settings** panel opens on the right side of the screen.
3. Choose a **permission level** (see table below).
4. Optionally set an **expiration date** — the link automatically stops working after this date.
5. Optionally add a **password** for an extra layer of verification.
6. Click **Create Link** — the URL is copied to your clipboard immediately.

### Permission levels

| Permission | View | Comment | Edit | Download |
|-----------|------|---------|------|---------|
| View only | ✓ | — | — | — |
| Comment | ✓ | ✓ | — | — |
| Edit | ✓ | ✓ | ✓ | — |
| Download | ✓ | ✓ | — | ✓ |

> NOTE: **Edit** permission allows the recipient to modify and save changes to the file. It does not grant the ability to delete or move the file.

### Sharing via email

Click **Share via Email** inside the share panel. Enter one or more email addresses separated by commas. Each recipient receives a formatted email from YourDrive with the link, your display name, and a brief note you can customise.

### Setting an expiration date

Expiration dates are optional but strongly recommended for sensitive documents.

1. In the Share Settings panel, click **Set expiration**.
2. Choose a date using the calendar picker — or type a date manually.
3. After the expiration date, the link returns a \`403 Forbidden\` error and cannot be used.

> TIP: You can extend an expiration date at any time by reopening the Share Settings panel and selecting a new date.

### Revoking a share link

To stop sharing a file immediately, regardless of expiration:

1. Open the file's Share Settings panel.
2. Click **Revoke Link**.
3. All existing share links for that file become invalid within seconds. Anyone currently viewing the file will be disconnected.

### Tracking link access

Pro and Enterprise users can see how many times a link has been accessed and from which regions. Open **Share Settings → Link Analytics** to view the access log.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "file-management",
    tags: ["share", "permissions", "link"],
    readTime: 5,
    relatedIds: ["fm-upload", "col-permissions", "sec-encryption"],
  },
  {
    id: "fm-organize",
    title: "Organizing files with folders and tags",
    excerpt:
      "Keep your storage tidy with nested folders, colour labels, and the star/favourite system.",
    content: `## Organising your files

A well-organised drive saves significant time and avoids the frustration of searching for misplaced files. YourDrive provides a full set of organisational tools — nested folders, favourites, colour labels, and recycle bin management — all accessible without leaving the dashboard.

### Creating folders

1. Click the **New Folder** button in the top toolbar, or right-click an empty space in the file list and select **New Folder**.
2. Type a folder name and press **Enter** to confirm.
3. Folders can be nested to any depth — create sub-folders by navigating into a folder before creating a new one.

> TIP: Folder names support Unicode, so you can use emoji, accented characters, and non-Latin scripts in your folder names.

### Moving files and folders

YourDrive offers three ways to move files:

- **Drag and drop** — drag one or more files directly into a destination folder in the file list or the left sidebar tree.
- **Right-click menu** — right-click any file or selection, choose **Move to**, and pick a destination from the folder picker.
- **Keyboard shortcut** — select files and press \`Ctrl+X\` (Windows) or \`Cmd+X\` (Mac) to cut, navigate to the destination, then press \`Ctrl+V\` / \`Cmd+V\` to paste.

### Selecting multiple files

- Hold \`Shift\` and click to select a range of files.
- Hold \`Ctrl\` (Windows) or \`Cmd\` (Mac) and click to select individual files non-contiguously.
- Press \`Ctrl+A\` / \`Cmd+A\` to select everything in the current folder.

### Starring favourites

Star any file or folder to add it to your **Starred** collection, accessible from the left sidebar.

Starred items also appear at the top of search results and are the first suggestions when using the move picker.

### Recycle Bin

Deleted files land in the Recycle Bin and are held for **30 days** before automatic permanent deletion. You will receive an email reminder **7 days before** a file is permanently deleted.

- To restore a file: open the Recycle Bin, right-click the file, and choose **Restore**. It returns to its original location.
- To permanently delete immediately: right-click and choose **Delete permanently**.

> WARNING: Files permanently deleted from the Recycle Bin cannot be recovered under any circumstances. YourDrive does not maintain snapshots or backups accessible to users.

### Storage quota note

Files in the Recycle Bin **still count** against your storage quota. If you are approaching your limit, empty the Recycle Bin to free up space immediately.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "file-management",
    tags: ["folders", "organize", "favourites"],
    readTime: 4,
    relatedIds: ["fm-upload", "fm-delete"],
  },
  {
    id: "fm-delete",
    title: "Deleting and recovering files",
    excerpt:
      "Understand how the Recycle Bin works and how to permanently remove files from your storage.",
    content: `## Deleting and recovering files

YourDrive uses a two-stage deletion model — files first move to the Recycle Bin, where they can be recovered, and are only permanently destroyed after a 30-day grace period (or when you explicitly choose to empty the bin).

### Moving files to the Recycle Bin

- **Single file**: right-click the file and choose **Delete**, or select it and press the \`Delete\` key.
- **Multiple files**: select multiple files using \`Shift+Click\` or \`Ctrl+Click\`, then press \`Delete\`.
- Files disappear from your main drive instantly and are no longer counted as accessible storage until permanently deleted.

> NOTE: Moving a file to the Recycle Bin does not immediately free up storage quota. The file still occupies space until it is permanently deleted.

### Recovering deleted files

1. Click **Recycle Bin** in the left sidebar.
2. Find the file you want to restore — you can search by name or filter by deletion date.
3. Right-click the file and choose **Restore**.
4. The file returns to its **original folder**. If the original folder was also deleted, it is recreated automatically.

### Permanent deletion

If you want to remove a file before the 30-day window expires:

1. Open the Recycle Bin.
2. Right-click a file and choose **Delete permanently** — or select multiple files and click **Delete selected** from the toolbar.
3. To remove everything at once, click **Empty Recycle Bin** in the top-right corner of the Recycle Bin view.

> IMPORTANT: Permanent deletion is irreversible. YourDrive does not keep backups accessible to users. Permanently deleted files cannot be recovered under any circumstances.

### Automatic cleanup schedule

Files in the Recycle Bin are automatically and permanently deleted on the following schedule:

| Days since deletion | Action |
|--------------------|--------|
| Day 0–23 | File is recoverable |
| Day 23 | Warning email sent to account owner |
| Day 30 | File is permanently and irreversibly deleted |

### Deleting shared files

If you delete a file that is currently shared via a link, the share link immediately stops working for all recipients. If you restore the file, the original share link is **not** restored — you would need to create a new one.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "file-management",
    tags: ["delete", "recycle bin", "recover"],
    readTime: 3,
    relatedIds: ["fm-organize", "am-storage"],
  },

  // ── Account Management ────────────────────────────────────────
  {
    id: "am-storage",
    title: "Understanding your storage plan",
    excerpt:
      "Compare Free, Pro, and Enterprise storage plans and learn how to upgrade your account.",
    content: `## Storage plans

YourDrive offers three storage tiers designed for individuals, professionals, and organisations. Each plan includes cloud storage, file previews, sharing capabilities, and access from any device.

### Plan comparison

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Storage | 5 GB | 1 TB | Custom |
| Max file size | 2 GB | 50 GB | Unlimited |
| Daily upload | 10 GB | Unlimited | Unlimited |
| Bandwidth | Shared pool | Dedicated | Dedicated |
| Link analytics | — | ✓ | ✓ |
| Priority support | — | ✓ | ✓ |
| SLA guarantee | — | 99.5% | 99.9% |
| Admin controls / SSO | — | — | ✓ |

### Free plan

The Free plan is designed for personal use and light cloud storage. It includes all core features — upload, preview, sharing, and the Recycle Bin — with a 5 GB storage cap.

> TIP: If you sign up with a valid **.edu** email address, you automatically receive a **+20 GB bonus** on top of your Free plan. The bonus is applied within minutes of account creation and does not expire.

### Pro plan

The Pro plan is designed for professionals, freelancers, and small teams who need reliable cloud storage with no daily upload restrictions and priority customer support. Billing is monthly or annual — annual plans receive a 20% discount.

### Enterprise plan

Enterprise accounts are custom-configured for your organisation's needs. Pricing is based on storage volume, user count, and required features. Contact **sales@yourdrive.io** to discuss a custom contract with SLA guarantees, SSO integration, and a dedicated account manager.

### Upgrading your plan

1. Open **Dashboard → Settings → Billing**.
2. Select the plan you want to switch to.
3. Complete the payment flow — upgrade takes effect **immediately**.
4. All your existing files, folders, and share links are preserved.

> NOTE: Downgrading to a lower plan is possible, but your storage must not exceed the new plan's limit at the time of downgrade. Archive or delete files to make room before switching.

### Checking storage usage

Your current usage is always visible in the **left sidebar** as a progress bar. Click it to open a detailed breakdown showing how your storage is distributed across file types and folders.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "account-management",
    tags: ["storage", "plans", "billing", "upgrade"],
    readTime: 4,
    relatedIds: ["am-billing", "am-profile"],
  },
  {
    id: "am-profile",
    title: "Managing your profile and account settings",
    excerpt:
      "Update your name, email, avatar, and notification preferences from the Settings page.",
    content: `## Account settings

Your YourDrive account settings are all accessible from one place. Open **Settings** from the sidebar or by clicking your avatar in the top-right corner.

### Updating personal information

Navigate to **Settings → Profile** to update:

- **Display name** — shown in file-sharing emails and collaboration notifications.
- **Email address** — used for login and all system notifications. Changing your email requires re-verification from the new address before the change takes effect.
- **Profile avatar** — upload a JPEG or PNG image under 5 MB. Square images work best; the image is automatically cropped to a circle.

### Changing your password

1. Go to **Settings → Security**.
2. Click **Change password**.
3. Enter your current password, then your new password twice.
4. Click **Save**. You will receive a confirmation email.

> TIP: Use a password manager to generate a strong, unique password. YourDrive requires a minimum of 10 characters and at least one number or symbol.

### Notification preferences

Control exactly which emails you receive from YourDrive:

- **File shared with me** — notifies you when someone adds you as a collaborator.
- **Storage quota alerts** — sent at 80% and 95% usage. Recommended to keep enabled.
- **Security alerts** — sent on new device sign-ins or password changes. We strongly recommend keeping these enabled.
- **Product updates** — occasional emails about new features and improvements. Optional.

To manage these, go to **Settings → Notifications** and toggle each category on or off.

### Connected accounts

If you signed up or linked your account with Google, GitHub, or Facebook, you can manage those connections under **Settings → Connected Accounts**. You can link or unlink social providers at any time, provided at least one login method remains active.

### Deleting your account

> IMPORTANT: Account deletion is permanent and irreversible. All your files, folders, share links, and account data will be removed within 30 days. Backups are purged within 90 days. Download any files you want to keep before proceeding.

To delete your account: **Settings → Account → Delete Account**. You will be asked to confirm by typing your email address, and then to complete a final verification step.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "account-management",
    tags: ["profile", "settings", "email", "notifications"],
    readTime: 4,
    relatedIds: ["am-storage", "sec-2fa"],
  },
  {
    id: "am-billing",
    title: "Enterprise billing, invoices, and payment methods",
    excerpt:
      "Learn about enterprise invoicing, custom contracts, and accepted payment methods for large teams.",
    content: `## Billing and payments

YourDrive offers flexible billing options for individuals and enterprise organisations. All payment processing is handled through our PCI-compliant payment provider.

### Accepted payment methods

| Method | Available for |
|--------|--------------|
| Credit / debit card (Visa, Mastercard, Amex) | All plans |
| SEPA bank transfer | EU businesses (Pro and Enterprise) |
| Wire transfer | Enterprise contracts only |
| Annual invoice billing | Enterprise contracts on request |

> NOTE: YourDrive never stores your full card number. All card data is tokenised by our payment provider and is subject to PCI-DSS Level 1 compliance.

### Monthly vs. annual billing

Pro plan subscribers can choose between monthly or annual billing. Annual billing offers a **20% discount** and is billed as a single payment at the start of the billing period.

To switch between billing cycles: **Settings → Billing → Change billing cycle**. The switch takes effect at your next renewal date.

### Enterprise contracts

Enterprise plans are scoped and priced based on your organisation's requirements. To start the procurement process:

1. Email **sales@yourdrive.io** with an overview of your team size and storage needs.
2. A YourDrive account executive will reach out within one business day.
3. We provide a custom contract with SLA terms, pricing, and onboarding timeline.
4. Once signed, the Enterprise account is provisioned within 24 hours.

### VAT and invoices

Invoices are generated automatically for every billing cycle and are available in **Settings → Billing → Invoice History** as downloadable PDFs.

EU businesses can add their **VAT number** under **Settings → Billing → Tax information**. Once added, future invoices will be zero-rated and include your VAT registration number.

### Refund policy

- **Pro plan (monthly)**: unused months are not refunded.
- **Pro plan (annual)**: unused months are refundable on a pro-rata basis within 30 days of the original purchase.
- **Enterprise plans**: refund terms are specified in your individual contract.

Contact **billing@yourdrive.io** to initiate a refund request.

> TIP: If you are evaluating YourDrive for your organisation, request a 30-day Enterprise trial at no cost by contacting the sales team.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "account-management",
    tags: ["billing", "enterprise", "payment", "invoice"],
    readTime: 4,
    relatedIds: ["am-storage", "am-profile"],
  },
  {
    id: "am-devices",
    title: "Managing trusted devices and active sessions",
    excerpt:
      "See all devices logged into your account and revoke access to devices you don't recognise.",
    content: `## Trusted devices and sessions

YourDrive keeps a record of every device and session that has accessed your account. Regularly reviewing this list is a simple but effective security practice.

### Viewing active sessions

Navigate to **Settings → Devices** (or **Settings → Security → Active Sessions**) to see a full list of devices currently signed into your account.

Each session entry shows:

- **Device name and type** — e.g. "Chrome on macOS 14", "iPhone 16 (Safari)"
- **IP address** — the IP used at the time of last access
- **Location** — country and city approximation based on IP geolocation
- **Last active** — timestamp of the most recent action from that session
- **Current session** — your current session is labelled and cannot be revoked from this panel

### Revoking a device

If you see a session you don't recognise — or a device you no longer use:

1. Click **Revoke** next to the session entry.
2. That session's access token is immediately invalidated.
3. The device will be signed out the next time it attempts an action. They must log in again from scratch.

> TIP: After revoking an unfamiliar session, immediately change your password and enable two-factor authentication if you haven't already.

### Revoking all other devices at once

Click **Sign out all other devices** to invalidate every session except your current one. This is the fastest way to secure your account if you suspect compromise.

> WARNING: This action cannot be undone. All other devices will need to re-authenticate. Devices that were mid-upload or performing background sync will stop immediately.

### Automatic session expiry

For security, idle sessions expire automatically after **90 days** of inactivity. After expiry, the user must log in again. This limit cannot be changed on Free or Pro plans; Enterprise plans can configure a custom session lifetime through the admin panel.

### Passkey support

YourDrive supports **passkey authentication** (FIDO2/WebAuthn) as an alternative to passwords. Passkeys are bound to a specific device and provide phishing-resistant login. Manage your passkeys under **Settings → Security → Passkeys**.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "account-management",
    tags: ["devices", "sessions", "security"],
    readTime: 3,
    relatedIds: ["sec-2fa", "am-profile"],
  },

  // ── Security ─────────────────────────────────────────────────
  {
    id: "sec-encryption",
    title: "How YourDrive protects your files",
    excerpt:
      "End-to-end encryption, at-rest AES-256 encryption, and TLS in transit — your files are always protected.",
    content: `## Security architecture

YourDrive is built on a security-first architecture. This article explains the technical measures in place to protect your files, your account, and your data at every stage.

### Encryption in transit

Every connection between your browser or app and the YourDrive infrastructure uses **TLS 1.3**. Connections using TLS 1.2 or older are rejected with a protocol error. Our TLS configuration achieves an **A+ rating** on the Qualys SSL Labs test.

This means that even if your network traffic is intercepted — for example on an untrusted Wi-Fi network — the data cannot be read or tampered with.

### Encryption at rest

All files stored on YourDrive are encrypted using **AES-256-GCM** with a unique encryption key per file. Encryption keys are themselves encrypted using a master key stored in a hardware security module (HSM) with strict access controls.

> NOTE: Even YourDrive employees with physical access to the storage infrastructure cannot read your files. Decryption requires the per-file key derived from your account, which is not stored alongside the data.

### Access controls

Your files are never accessible to anyone other than yourself and people you have explicitly shared with:

- Share links are **cryptographically random** 128-bit tokens — unguessable by brute force.
- Expired or revoked links return \`HTTP 403\` immediately.
- All API requests are authenticated with short-lived, rotated tokens.
- Failed login attempts trigger rate limiting and account lockout after repeated failures.

### Infrastructure security

| Layer | Control |
|-------|---------|
| Network | DDoS protection, Web Application Firewall (WAF), private VPC |
| Application | Input validation, OWASP Top 10 mitigations, dependency scanning |
| Data | AES-256 at rest, TLS 1.3 in transit, HSM key management |
| Monitoring | 24/7 anomaly detection, security incident response team |
| Compliance | SOC 2 Type II observation period (in progress) |

### Vulnerability disclosure

YourDrive operates a responsible disclosure programme. If you discover a security vulnerability, please email **security@yourdrive.io**. We acknowledge all reports within 24 hours and provide updates throughout the investigation.

> TIP: Enable **two-factor authentication** on your account for an additional layer of protection that prevents unauthorised access even if your password is compromised.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "security",
    tags: ["encryption", "security", "privacy", "soc2"],
    readTime: 5,
    relatedIds: ["sec-2fa", "fm-share"],
  },
  {
    id: "sec-2fa",
    title: "Setting up two-factor authentication (2FA)",
    excerpt:
      "Add an extra layer of security to your account with TOTP-based two-factor authentication.",
    content: `## Two-factor authentication

Two-factor authentication (2FA) adds a second verification step at login, making your account significantly more secure. Even if an attacker obtains your password, they cannot access your account without the second factor.

YourDrive supports **TOTP-based 2FA** (Time-based One-Time Passwords), compatible with all major authenticator apps including Google Authenticator, Authy, 1Password, Bitwarden, and Apple's built-in passwords app.

### Enabling 2FA

1. Go to **Settings → Security → Two-Factor Authentication**.
2. Click **Enable 2FA**.
3. Open your authenticator app and scan the **QR code** displayed on screen, or manually enter the setup key shown below the QR code.
4. Enter the **6-digit code** currently displayed in your authenticator app to verify setup.
5. YourDrive shows your **backup codes** — save these immediately (see below).
6. Click **Confirm** to activate 2FA on your account.

> IMPORTANT: Backup codes are shown **only once**. Save them in a secure location (a password manager is ideal). Each code can be used exactly once to bypass 2FA if you lose access to your authenticator app.

### Logging in with 2FA

Once 2FA is enabled, your login flow changes:

1. Enter your email and password as usual.
2. You are prompted for a **6-digit code**.
3. Open your authenticator app, find the YourDrive entry, and enter the current code.
4. Codes refresh every **30 seconds** — if a code is about to expire, wait for the next one before submitting.

### Disabling 2FA

If you need to disable 2FA (for example, when switching authenticator apps):

1. Go to **Settings → Security → Two-Factor Authentication**.
2. Click **Disable 2FA**.
3. Confirm with your current authenticator code or a backup code.
4. 2FA is immediately deactivated. You can re-enrol at any time.

### Lost access to your authenticator

If you lose your phone or cannot access your authenticator app:

1. On the 2FA prompt at login, click **Use a backup code**.
2. Enter one of your saved backup codes.
3. You are signed in and can then go to Settings to disable 2FA and re-enrol with a new device.

> WARNING: If you have lost both your authenticator device and all backup codes, account recovery is not possible through automated means. Contact **support@yourdrive.io** with proof of ownership to begin a manual identity verification process. This process takes 3–5 business days.

### Recommended authenticator apps

| App | Platform | Notes |
|-----|---------|-------|
| Authy | iOS, Android, Desktop | Supports cloud backup of 2FA codes |
| 1Password | iOS, Android, Desktop, Browser | Integrated with password manager |
| Google Authenticator | iOS, Android | Simple, no account needed |
| Bitwarden | All platforms | Open source, free |`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "security",
    tags: ["2fa", "authentication", "security"],
    readTime: 5,
    relatedIds: ["sec-encryption", "am-devices"],
  },
  {
    id: "sec-privacy",
    title: "Privacy controls and data deletion",
    excerpt:
      "Understand what data YourDrive collects, how it is used, and how to request full data deletion.",
    content: `## Privacy and data controls

YourDrive is committed to data minimisation — we collect only what is necessary to operate the service. This article explains exactly what data we hold about you, how it is used, and your rights regarding that data.

### Data we collect

**Account data**
- Email address (required for authentication and notifications)
- Display name and profile avatar (optional, used in collaboration features)
- Password hash (stored using bcrypt with per-user salt; the original password is never stored)

**Usage and operational data**
- File metadata: name, size, MIME type, creation and modification timestamps
- Access logs: timestamps, IP addresses, and device information (used for security anomaly detection)
- Session data: authentication tokens with expiry (stored in httpOnly cookies)

**Billing data (Pro and Enterprise)**
- Payment is processed entirely by our PCI-compliant payment provider. YourDrive stores only a **tokenised reference** to your payment method — never a full card number, CVV, or bank account number.

### What we do NOT collect or process

- **File contents** — your files are stored encrypted and are never scanned, indexed, analysed, or used for any purpose other than delivering them back to you.
- **Precise location** — we use IP-based geolocation for country/city approximation in security alerts only.
- **Advertising profiles** — YourDrive does not sell data to advertisers or use your data for targeted advertising.

### Your rights

Under GDPR, UK GDPR, CCPA, and equivalent regulations, you have the following rights:

| Right | How to exercise |
|-------|----------------|
| Access | Email privacy@yourdrive.io from your registered address |
| Rectification | Update directly in Settings → Profile |
| Erasure | Settings → Account → Delete Account, or email privacy@yourdrive.io |
| Portability | Included in account deletion export |
| Restriction / Objection | Email privacy@yourdrive.io |

We respond to all data rights requests within **30 days**.

### Requesting an export of your data

Before deleting your account, or at any time, you can request a machine-readable export of all data YourDrive holds about you. Email **privacy@yourdrive.io** from your registered address. The export is delivered as a JSON package within 30 days.

### Deleting your account

Deleting your account initiates a full erasure process:

- Your files, folders, share links, and account records are deleted within **30 days**.
- Automated backups containing your data are purged within **90 days**.
- Anonymised aggregate statistics (e.g. total storage used per plan tier) may be retained indefinitely.

> IMPORTANT: Account deletion is irreversible. Ensure you have downloaded all files you wish to keep before proceeding. Navigate to **Settings → Account → Delete Account** to begin.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "security",
    tags: ["privacy", "gdpr", "data deletion"],
    readTime: 5,
    relatedIds: ["sec-encryption", "am-profile"],
  },

  // ── Collaboration ─────────────────────────────────────────────
  {
    id: "col-permissions",
    title: "Setting collaboration permissions",
    excerpt:
      "Control exactly who can view, comment, edit, or download shared files and folders.",
    content: `## Collaboration permissions

YourDrive's permission system gives you precise control over what collaborators can do with shared files. Permissions are set per-file or per-folder and can be changed at any time.

### Understanding permission levels

| Permission | View | Leave comments | Edit file | Download copy |
|-----------|------|---------------|----------|--------------|
| View only | ✓ | — | — | — |
| Comment | ✓ | ✓ | — | — |
| Edit | ✓ | ✓ | ✓ | — |
| Download | ✓ | ✓ | — | ✓ |

> NOTE: **Edit** permission allows a collaborator to modify and save changes to the file content. It does not grant the ability to move, rename, or delete the file. Only the file owner can perform those actions.

### Setting permissions on a file

1. Right-click a file in your dashboard and select **Share**, or click the share icon in the action bar.
2. In the **Share Settings** panel, find the **Permission** dropdown.
3. Select the desired permission level.
4. If sharing via link, the permission applies to anyone who uses the link.
5. If sharing via email invite, you can set different permission levels per recipient.

### Folder-level permissions and inheritance

When you set a permission on a folder, it automatically applies to all files inside that folder. This is called permission inheritance.

Individual files inside a shared folder can have their permissions **tightened** (e.g. a file inside an "Edit" folder can be set to "View only"). However, a file's permission **cannot be loosened** beyond its parent folder's permission level.

> TIP: For sensitive files inside a shared folder, set the file to "View only" to prevent editing or downloading, even if the folder allows it.

### Setting expiration dates

Every permission can have an associated expiration date. After the expiration, the share link or collaborator invitation becomes inactive automatically.

1. In the Share Settings panel, click **Set expiration**.
2. Choose a date — the link stops working at midnight UTC on that date.
3. You can modify or remove the expiration at any time.

### Password-protecting a share link

Add a password to any share link for an additional verification layer:

1. In the Share Settings panel, toggle on **Password protection**.
2. Set a password (minimum 6 characters).
3. Share the link and the password through separate channels for better security.

### Revoking permissions

To remove a collaborator's access:

- **Link-based sharing**: click **Revoke link** in Share Settings. All copies of the link stop working immediately.
- **Email invite**: in Share Settings, find the collaborator in the list and click **Remove**.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "collaboration",
    tags: ["permissions", "collaboration", "share"],
    readTime: 5,
    relatedIds: ["fm-share", "col-teams"],
  },
  {
    id: "col-teams",
    title: "Working with teams on YourDrive",
    excerpt:
      "Create shared team folders, invite members, and manage access across your organisation.",
    content: `## Team collaboration

YourDrive is designed for both individual use and team collaboration. Shared folders give teams a central workspace where all members can upload, view, and manage files according to their permission level.

### Creating a shared team folder

1. In your dashboard, click **New Folder** to create a folder (or select an existing one).
2. Right-click the folder and select **Share**.
3. In the Share Settings panel, switch to the **Collaborators** tab.
4. Enter the email addresses of your team members, separated by commas.
5. Assign a permission level for the group (individual overrides can be set per person).
6. Click **Send invites**.

Each team member receives an email invitation. If they do not already have a YourDrive account, they are prompted to create a free one. The shared folder will appear in their **Shared with me** section.

> TIP: Give the shared folder a clear, descriptive name (e.g. "Marketing Assets — Q3 2025") to make it easy to identify in every team member's drive.

### Managing team members

At any time, you can open the folder's Share Settings to:

- **View all current collaborators** and their permission levels.
- **Change a specific person's permission** — click their name and choose a new level.
- **Remove a collaborator** — click the \`×\` next to their name. Their access is revoked immediately.
- **Transfer ownership** — hand over full ownership to another collaborator (Enterprise only).

### Real-time collaboration awareness

When multiple team members are actively viewing or editing a file, YourDrive displays **presence indicators** — small avatars showing who is currently in the file. Changes are synchronised in near real-time.

### Activity log

Each shared folder has a built-in **Activity Feed** that logs every action taken inside it:

- Files uploaded, moved, renamed, or deleted
- Permission changes
- New collaborator invitations
- File edits and saves

Access the activity log by opening the folder, then clicking **Activity** in the right sidebar.

### Enterprise team management

Enterprise accounts include a dedicated **Admin Panel** with additional capabilities:

| Feature | Description |
|---------|-------------|
| Bulk user management | Add, remove, or update permissions for multiple users at once |
| SCIM provisioning | Automatically sync users and groups from your identity provider |
| SSO integration | Allow employees to sign in with your existing corporate credentials |
| Usage reporting | See storage and activity breakdowns per user or department |
| Audit logs | Exportable compliance logs of all account-level events |

> NOTE: Enterprise features require a custom contract. Contact **sales@yourdrive.io** to discuss your requirements.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "collaboration",
    tags: ["teams", "collaboration", "folders"],
    readTime: 5,
    relatedIds: ["col-permissions", "fm-share"],
  },
  {
    id: "col-sharing-link",
    title: "Sharing files with external users",
    excerpt:
      "Share files with people outside your organisation using secure links — no account required.",
    content: `## External sharing

YourDrive makes it straightforward to share files with people outside your organisation — clients, partners, or the public — without requiring them to create a YourDrive account.

### Public vs. private share links

YourDrive offers two types of external share links:

**Public links** — accessible to anyone who has the URL, without any additional authentication. Use these for assets you want broadly accessible, such as marketing materials, public documentation, or demo files.

**Private links (password-protected)** — accessible only to people who know both the URL and the password. This adds a meaningful barrier against accidental access or link forwarding.

> TIP: For sensitive documents, always use a private link. Send the URL and password through separate channels (e.g. the link by email and the password by SMS or a separate messaging app).

### Creating an external share link

1. Right-click any file in your dashboard and select **Share**.
2. In the Share Settings panel, toggle to the **Link** tab.
3. Choose **Public** or **Private** (enter a password if Private is selected).
4. Set a permission level for the recipient (View, Download, etc.).
5. Optionally set an expiration date.
6. Click **Create Link** — the short link is automatically copied to your clipboard.

Every link has both a **full URL** and a **short link** (e.g. \`yourdrive.io/s/abc123\`) — the short version is suitable for use in emails and messages.

### What recipients can do

Recipients who open a share link do not need a YourDrive account. Depending on the permission level you set:

- **View only** — they can preview the file in the browser (documents, images, video, audio, PDFs).
- **Download** — they can save a copy to their device.
- **Comment** — they can leave inline comments (requires them to provide a name or email, which appears alongside their comments).

### Link analytics

Pro and Enterprise subscribers can see how their share links are being used. Open the file's Share Settings panel and click **Analytics** to view:

- Total number of views and downloads
- Geographic breakdown (country-level)
- Timeline of access events

> NOTE: Link analytics data is retained for 90 days. It is not personally identifiable and complies with our Privacy Policy.

### Disabling external sharing (Enterprise)

Enterprise administrators can disable external link sharing entirely for their organisation through the **Admin Panel → Sharing Policies**. When disabled, all share links return a \`403\` error and new links cannot be created by non-admin users.`,
    author: "Duje Žižić",
    authorRole: "Product Team",
    date: "September 11, 2025",
    category: "collaboration",
    tags: ["external sharing", "links", "public"],
    readTime: 4,
    relatedIds: ["fm-share", "col-permissions"],
  },
];

export function searchArticles(query: string): Article[] {
  if (!query.trim()) return ARTICLES;
  const q = query.toLowerCase();
  return ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)) ||
      a.content.toLowerCase().includes(q),
  );
}

export function getArticlesByCategory(category: HelpCategory): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getRelatedArticles(article: Article): Article[] {
  return article.relatedIds
    .map((id) => getArticleById(id))
    .filter((a): a is Article => a !== undefined);
}

export function buildKnowledgeBaseContext(): string {
  return ARTICLES.map(
    (a) =>
      `### ${a.title} (category: ${a.category})\n${a.excerpt}\n\nContent summary: ${a.content.slice(0, 400)}`,
  ).join("\n\n---\n\n");
}
