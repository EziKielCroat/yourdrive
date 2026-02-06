import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = this.getConfig();
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      },
    });

    // Verify connection on startup
    this.verifyConnection();
  }

  private getConfig(): EmailConfig {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587");
    const secure = process.env.SMTP_SECURE === "true";
    const user = process.env.SMTP_USER || "";
    const pass = process.env.SMTP_PASS || "";
    const from = process.env.SMTP_FROM || "noreply@nexacore.com";

    return {
      host,
      port,
      secure,
      auth: { user, pass },
      from,
    };
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      console.log(`📧 Email will be sent from: ${this.config.from}`);
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      console.log("⚠️  Emails will be logged to console instead");
    }
  }

  async verifyResetCode(hashedCode: string, code: string): Promise<boolean> {
    return await bcrypt.compare(code, hashedCode);
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
    resetToken: string,
    userId: string,
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&userId=${userId}`;
    const brandColor = "#1F9AFE";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - NexaCore</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: ${brandColor};
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              margin: 0;
              letter-spacing: 1px;
            }
            .tagline {
              font-size: 16px;
              opacity: 0.9;
              margin: 10px 0 0 0;
              font-weight: 400;
            }
            .content {
              background: #ffffff;
              padding: 40px;
              border-radius: 0 0 12px 12px;
              border: 1px solid #eaeaea;
              border-top: none;
            }
            .code-container {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
            }
            .reset-code {
              font-size: 48px;
              font-weight: 700;
              letter-spacing: 10px;
              margin: 15px 0;
              color: #1a1a1a;
              font-family: 'Courier New', monospace;
            }
            .button {
              display: inline-block;
              background: ${brandColor};
              color: white;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
              transition: all 0.2s ease;
              box-shadow: 0 4px 12px rgba(31, 154, 254, 0.2);
            }
            .button:hover {
              background: #0d8af2;
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(31, 154, 254, 0.3);
            }
            .info-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 20px;
              margin: 25px 0;
              border-radius: 10px;
              border-left: 4px solid ${brandColor};
            }
            .footer {
              margin-top: 40px;
              padding-top: 25px;
              border-top: 1px solid #eaeaea;
              font-size: 13px;
              color: #666;
              text-align: center;
            }
            .expiry-note {
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            .code-label {
              color: #555;
              font-size: 14px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
            }
            @media (max-width: 600px) {
              .content {
                padding: 25px;
              }
              .reset-code {
                font-size: 36px;
                letter-spacing: 6px;
              }
              .button {
                padding: 16px 32px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">NEXACORE</h1>
              <p class="tagline">Next Generation Cloud Storage</p>
            </div>
            
            <div class="content">
              <h2 style="margin-top: 0; color: #1a1a1a;">Password Reset Request</h2>
              <p style="font-size: 16px; line-height: 1.7; color: #444;">
                You requested to reset your NexaCore password. Use the verification code below to continue.
              </p>
              
              <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="reset-code">${resetCode}</div>
                <p class="expiry-note">This code expires in 15 minutes</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">
                  🔐 Reset Password Now
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 10px;">
                  Or enter the code manually in the reset form
                </p>
              </div>
              
              <div class="info-box">
                <strong style="color: #333;">📋 Need help?</strong>
                <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <code style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #333; display: inline-block; margin-top: 8px; word-break: break-all;">
                    ${resetLink}
                  </code>
                </p>
              </div>
              
              <p style="color: #666; font-size: 15px; line-height: 1.6;">
                <strong>Note:</strong> If you didn't request this password reset, please ignore this email. 
                Your account remains secure.
              </p>
              
              <div class="footer">
                <p style="margin: 0 0 10px 0;">
                  This is an automated message from <strong>NexaCore</strong>.
                </p>
                <p style="margin: 0 0 10px 0; color: #888;">
                  © ${new Date().getFullYear()} NexaCore. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                  Having trouble? Contact our support team or visit our Help Center.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: "NexaCore - Password Reset Code",
      html,
    });
  }

  async sendVerificationEmail(
    email: string,
    firstName: string | undefined,
    verificationToken: string,
    isSkoleUser: boolean = false,
  ): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const brandColor = "#1F9AFE";

    const bonusText = isSkoleUser
      ? `<div style="background: linear-gradient(135deg, #1F9AFE, #0d8af2); color: white; padding: 15px 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
      <div style="font-size: 24px; margin-bottom: 8px;">🎓</div>
      <strong style="font-size: 18px;">Educational Account Detected!</strong>
      <p style="margin: 8px 0 0 0; opacity: 0.95; font-size: 14px;">
        After verifying your email, you'll receive <strong>+50GB bonus storage</strong> on top of your plan!
      </p>
    </div>`
      : "";

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - NexaCore</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: ${brandColor};
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .logo {
            font-size: 32px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 1px;
          }
          .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin: 10px 0 0 0;
            font-weight: 400;
          }
          .content {
            background: #ffffff;
            padding: 40px;
            border-radius: 0 0 12px 12px;
            border: 1px solid #eaeaea;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: ${brandColor};
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(31, 154, 254, 0.2);
          }
          .button:hover {
            background: #0d8af2;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(31, 154, 254, 0.3);
          }
          .info-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            margin: 25px 0;
            border-radius: 10px;
            border-left: 4px solid ${brandColor};
          }
          .footer {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #eaeaea;
            font-size: 13px;
            color: #666;
            text-align: center;
          }
          .expiry-note {
            color: #666;
            font-size: 14px;
            margin-top: 15px;
            text-align: center;
          }
          @media (max-width: 600px) {
            .content {
              padding: 25px;
            }
            .button {
              padding: 16px 32px;
              font-size: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">NEXACORE</h1>
            <p class="tagline">Next Generation Cloud Storage</p>
          </div>
          
          <div class="content">
            <h2 style="margin-top: 0; color: #1a1a1a;">Welcome${firstName ? `, ${firstName}` : ""}! 👋</h2>
            <p style="font-size: 16px; line-height: 1.7; color: #444;">
              Thanks for signing up for NexaCore! We're excited to have you on board.
            </p>
            
            <p style="font-size: 16px; line-height: 1.7; color: #444;">
              To get started and access your secure cloud storage, please verify your email address by clicking the button below:
            </p>
            
            ${bonusText}
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${verificationLink}" class="button">
                ✅ Verify Email Address
              </a>
            </div>
            
            <p class="expiry-note">
              ⏰ This link expires in 24 hours
            </p>
            
            <div class="info-box">
              <strong style="color: #333;">🔗 Link not working?</strong>
              <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">
                Copy and paste this URL into your browser:<br>
                <code style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #333; display: inline-block; margin-top: 8px; word-break: break-all;">
                  ${verificationLink}
                </code>
              </p>
            </div>
            
            <p style="color: #666; font-size: 15px; line-height: 1.6; margin-top: 30px;">
              <strong>Didn't create an account?</strong><br>
              If you didn't sign up for NexaCore, you can safely ignore this email.
            </p>
            
            <div class="footer">
              <p style="margin: 0 0 10px 0;">
                This is an automated message from <strong>NexaCore</strong>.
              </p>
              <p style="margin: 0 0 10px 0; color: #888;">
                © ${new Date().getFullYear()} NexaCore. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">
                Need help? Contact our support team.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    await this.sendEmail({
      to: email,
      subject: isSkoleUser
        ? "Verify Your Email - Get +50GB Educational Bonus! 🎓"
        : "Verify Your Email - Welcome to NexaCore!",
      html,
    });
  }

  async sendShareEmail(
    recipientEmail: string,
    ownerName: string,
    fileName: string,
    shareUrl: string,
    permission: string,
    hasPassword: string,
    expiresAt: string,
    maxDownloads: string,
  ): Promise<void> {
    const brandColor = "#1F9AFE";
    const permissionLabels: Record<string, string> = {
      view: "View only",
      comment: "Comment",
      edit: "Edit",
      download: "Download",
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>File Shared with You - NexaCore</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: ${brandColor};
              color: white;
              padding: 40px 20px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .logo {
              font-size: 32px;
              font-weight: 800;
              margin: 0;
              letter-spacing: 1px;
            }
            .tagline {
              font-size: 16px;
              opacity: 0.9;
              margin: 10px 0 0 0;
              font-weight: 400;
            }
            .content {
              background: #ffffff;
              padding: 40px;
              border-radius: 0 0 12px 12px;
              border: 1px solid #eaeaea;
              border-top: none;
            }
            .file-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
            }
            .file-name {
              font-size: 18px;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 15px;
            }
            .file-details {
              display: grid;
              gap: 12px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              color: #666;
              font-size: 14px;
            }
            .detail-value {
              color: #1a1a1a;
              font-weight: 500;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              background: ${brandColor};
              color: white;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 16px;
              margin: 25px 0;
              transition: all 0.2s ease;
              box-shadow: 0 4px 12px rgba(31, 154, 254, 0.2);
            }
            .button:hover {
              background: #0d8af2;
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(31, 154, 254, 0.3);
            }
            .info-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 20px;
              margin: 25px 0;
              border-radius: 10px;
              border-left: 4px solid ${brandColor};
            }
            .footer {
              margin-top: 40px;
              padding-top: 25px;
              border-top: 1px solid #eaeaea;
              font-size: 13px;
              color: #666;
              text-align: center;
            }
            @media (max-width: 600px) {
              .content {
                padding: 25px;
              }
              .button {
                padding: 16px 32px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">NEXACORE</h1>
              <p class="tagline">Next Generation Cloud Storage</p>
            </div>
            
            <div class="content">
              <h2 style="margin-top: 0; color: #1a1a1a;">File Shared with You 📎</h2>
              <p style="font-size: 16px; line-height: 1.7; color: #444;">
                <strong>${ownerName}</strong> has shared a file with you on NexaCore.
              </p>
              
              <div class="file-card">
                <div class="file-name">📄 ${fileName}</div>
                <div class="file-details">
                  <div class="detail-row">
                    <span class="detail-label">Permission:</span>
                    <span class="detail-value">${permissionLabels[permission] || permission}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Password Protected:</span>
                    <span class="detail-value">${hasPassword}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Expires:</span>
                    <span class="detail-value">${expiresAt}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Download Limit:</span>
                    <span class="detail-value">${maxDownloads}</span>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${shareUrl}" class="button">
                  🔗 Access Shared File
                </a>
              </div>
              
              <div class="info-box">
                <strong style="color: #333;">🔒 Security Note</strong>
                <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">
                  ${hasPassword === "Yes" ? "This file is password protected. You'll need the password to access it." : "This file is publicly accessible via the link above."}
                </p>
              </div>
              
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin-top: 30px;">
                <strong>Didn't expect this email?</strong><br>
                If you didn't expect to receive this file, you can safely ignore this email.
              </p>
              
              <div class="footer">
                <p style="margin: 0 0 10px 0;">
                  This is an automated message from <strong>NexaCore</strong>.
                </p>
                <p style="margin: 0 0 10px 0; color: #888;">
                  © ${new Date().getFullYear()} NexaCore. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                  Need help? Contact our support team.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: `${ownerName} shared "${fileName}" with you`,
      html,
    });
  }

  async sendWelcomeEmail(
    email: string,
    firstName?: string,
    hasBonus: boolean = false,
  ): Promise<void> {
    const brandColor = "#1F9AFE";
    const storageInfo = hasBonus
      ? "<strong>100GB total storage</strong> (includes 50GB educational bonus)"
      : "<strong>50GB of free storage</strong>";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to NexaCore!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: ${brandColor};
              color: white;
              padding: 50px 20px;
              text-align: center;
              border-radius: 12px 12px 0 0;
            }
            .logo {
              font-size: 36px;
              font-weight: 800;
              margin: 0;
              letter-spacing: 1px;
            }
            .tagline {
              font-size: 18px;
              opacity: 0.9;
              margin: 15px 0 0 0;
              font-weight: 400;
            }
            .content {
              background: #ffffff;
              padding: 40px;
              border-radius: 0 0 12px 12px;
              border: 1px solid #eaeaea;
              border-top: none;
            }
            .bonus-badge {
              background: linear-gradient(135deg, #1F9AFE, #0d8af2);
              color: white;
              padding: 10px 20px;
              border-radius: 24px;
              display: inline-block;
              font-weight: 600;
              font-size: 14px;
              margin: 15px 0;
              box-shadow: 0 4px 12px rgba(31, 154, 254, 0.2);
            }
            .storage-card {
              background: #f8fafc;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
              border: 1px solid #e2e8f0;
            }
            .features-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 35px 0;
            }
            .feature {
              background: #f8fafc;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              transition: transform 0.2s ease;
              border: 1px solid #e2e8f0;
            }
            .feature:hover {
              transform: translateY(-5px);
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
            }
            .feature-icon {
              font-size: 32px;
              margin-bottom: 12px;
            }
            .button {
              display: inline-block;
              background: ${brandColor};
              color: white;
              padding: 18px 40px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              transition: all 0.2s ease;
              box-shadow: 0 4px 12px rgba(31, 154, 254, 0.2);
            }
            .button:hover {
              background: #0d8af2;
              transform: translateY(-2px);
              box-shadow: 0 6px 16px rgba(31, 154, 254, 0.3);
            }
            .footer {
              margin-top: 40px;
              padding-top: 25px;
              border-top: 1px solid #eaeaea;
              font-size: 13px;
              color: #666;
              text-align: center;
            }
            @media (max-width: 600px) {
              .features-grid {
                grid-template-columns: 1fr;
              }
              .content {
                padding: 25px;
              }
              .header {
                padding: 40px 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">NEXACORE</h1>
              <p class="tagline">Welcome to Next Generation Cloud Storage</p>
            </div>
            
            <div class="content">
              <h2 style="margin-top: 0; color: #1a1a1a;">Welcome ${firstName || "to NexaCore"}! 🎉</h2>
              <p style="font-size: 16px; line-height: 1.7; color: #444;">
                Your NexaCore account has been successfully created and is ready to use.
              </p>
              
              ${hasBonus ? '<div class="bonus-badge">🎓 +50GB EDUCATIONAL BONUS ACTIVATED</div>' : ""}
              
              <div class="storage-card">
                <h3 style="margin-top: 0; color: #1a1a1a; font-size: 20px;">📦 Your Storage Plan</h3>
                <p style="font-size: 18px; margin: 15px 0; color: #333;">
                  ${storageInfo}
                </p>
                ${hasBonus ? '<p style="color: #0d8af2; margin: 10px 0 0 0; font-weight: 500;">✨ Thank you for using an educational email address!</p>' : ""}
              </div>
              
              <h3 style="color: #1a1a1a; margin-top: 30px;">✨ Get Started in Seconds</h3>
              
              <div class="features-grid">
                <div class="feature">
                  <div class="feature-icon">⚡</div>
                  <strong style="color: #333; font-size: 16px;">Lightning Fast</strong>
                  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">Upload and access files instantly</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">🔒</div>
                  <strong style="color: #333; font-size: 16px;">Bank-Level Security</strong>
                  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">Military-grade encryption</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">🌐</div>
                  <strong style="color: #333; font-size: 16px;">Anywhere Access</strong>
                  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">All devices, all platforms</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">🤝</div>
                  <strong style="color: #333; font-size: 16px;">Easy Sharing</strong>
                  <p style="font-size: 14px; color: #666; margin: 10px 0 0 0;">Share with anyone, anywhere</p>
                </div>
              </div>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/dashboard" class="button">
                  🚀 Launch Your Dashboard
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 15px;">
                  Start uploading, sharing, and collaborating immediately
                </p>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 30px 0;">
                <p style="margin: 0; color: #555; text-align: center;">
                  <strong>Need help getting started?</strong><br>
                  Check out our <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/help" style="color: #1F9AFE; text-decoration: none; font-weight: 600;">Getting Started Guide</a>
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 0 0 10px 0;">
                  Welcome to the future of cloud storage with <strong>NexaCore</strong>.
                </p>
                <p style="margin: 0 0 10px 0; color: #888;">
                  © ${new Date().getFullYear()} NexaCore Technologies. All rights reserved.
                </p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                  You're receiving this email because you created a NexaCore account.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Welcome to NexaCore${firstName ? `, ${firstName}` : ""}! Your Cloud Awaits`,
      html,
    });
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    const { to, subject, html } = options;

    try {
      // Check if SMTP is configured
      if (!this.config.auth.user || !this.config.auth.pass) {
        console.log("⚠️ SMTP not configured. Email would be sent to:", to);
        return;
      }

      const mailOptions = {
        from: `NexaCore <${this.config.from}>`,
        to,
        subject,
        html,
        text: this.htmlToText(html),
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`   Subject: ${subject}`);

      // Show preview URL if available (Mailtrap)
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);

      // For development, don't crash - just log and continue
      console.log("⚠️  Email service error, but continuing...");
    }
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion for email clients that don't support HTML
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/NEXACORE/g, "NEXACORE")
      .trim();
  }

  // STATIC UTILITY METHODS - These don't need access to 'this'
  static generateResetCode(): string {
    // Generate a 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static async hashResetCode(code: string): Promise<string> {
    return await bcrypt.hash(code, 10);
  }

  static async verifyResetCode(
    hashedCode: string,
    code: string,
  ): Promise<boolean> {
    return await bcrypt.compare(code, hashedCode);
  }
}

export const emailService = new EmailService();
