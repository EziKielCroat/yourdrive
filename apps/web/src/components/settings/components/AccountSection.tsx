import React, { useState, useRef, useEffect } from "react";
import {
  Section,
  SectionTitle,
  SectionDescription,
  ProfilePictureWrapper,
  Avatar,
  ButtonGroup,
  Button,
  SmallText,
  FormGroup,
  Label,
  Input,
  DangerZone,
  DangerItem,
  DangerInfo,
  DangerTitle,
  DangerDescription,
} from "../styles/settings.styles";
import { settingsService } from "../service/settingsService";
import { useSettings } from "../../shared/hooks/useSettings";
import type { UserSettings } from "../types/UserSettings";

interface AccountSectionProps {
  settings: UserSettings | null;
  updateProfile: (data: { email?: string; firstName?: string }) => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  settings,
  updateProfile,
}) => {
  const { deleteAccount, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    email: settings?.profile?.email || "",
    firstName: settings?.profile?.firstName || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(
    settings?.profile?.avatarUrl || null,
  );
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingFirstName, setSavingFirstName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prefill form when settings load
  useEffect(() => {
    if (!settings?.profile) return;
    setFormData({
      email: settings.profile.email || "",
      firstName: settings.profile.firstName || "",
    });
    setAvatarUrl(settings.profile.avatarUrl || null);
  }, [settings?.profile]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, firstName: e.target.value }));
  };

  const handleSaveEmail = async () => {
    try {
      setSavingEmail(true);
      setMessage("");
      await updateProfile({ email: formData.email.trim() });
      setMessage("Email saved");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save email");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveFirstName = async () => {
    try {
      setSavingFirstName(true);
      setMessage("");
      await updateProfile({ firstName: formData.firstName.trim() });
      setMessage("Name saved");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save name");
    } finally {
      setSavingFirstName(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.",
      )
    ) {
      return;
    }

    const confirmText = prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmText !== "DELETE") {
      return;
    }

    try {
      setDeleting(true);
      await deleteAccount();
      window.location.href = "/";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      setMessage(message);
      setDeleting(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    try {
      setUploadingAvatar(true);
      setMessage("");

      const response = await settingsService.uploadAvatar(file);

      if (response.avatarUrl) {
        setAvatarUrl(response.avatarUrl);
        setMessage("Avatar updated successfully!");
        await refreshSettings();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload avatar";
      setMessage(message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your avatar?")) {
      return;
    }

    try {
      setRemovingAvatar(true);
      setMessage("");

      await settingsService.deleteAvatar();

      setAvatarUrl(null);
      setMessage("Avatar removed successfully!");
      await refreshSettings();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to remove avatar";
      setMessage(message);
    } finally {
      setRemovingAvatar(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.charAt(0).toUpperCase() || "";
    if (first) return first;

    const email = formData.email || settings?.profile?.email || "";
    const emailInitial = email.charAt(0).toUpperCase();
    return emailInitial || "U";
  };

  const getAvatarDisplay = () => {
    if (avatarUrl) {
      return (
        <Avatar
          as="img"
          src={avatarUrl}
          alt="Profile avatar"
          style={{
            objectFit: "cover",
            width: "80px",
            height: "80px",
          }}
          onError={() => {
            // Fallback to initials if image fails to load (e.g. B2 URL not public)
            setAvatarUrl(null);
          }}
        />
      );
    }
    return <Avatar>{getInitials()}</Avatar>;
  };

  return (
    <>
      <Section>
        <SectionTitle>Personal Information</SectionTitle>
        <SectionDescription>
          Update your profile details and email address
        </SectionDescription>

        <ProfilePictureWrapper>
          {getAvatarDisplay()}

          <div>
            <ButtonGroup>
              <Button
                type="button"
                variant="default"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar || removingAvatar}
              >
                {avatarUrl ? "Change avatar" : "Upload avatar"}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || removingAvatar}
                >
                  Remove
                </Button>
              )}
            </ButtonGroup>
            <SmallText>JPG, PNG, GIF or WebP. Max 5MB.</SmallText>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </ProfilePictureWrapper>

        <FormGroup>
          <Label>Email</Label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <Input
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              style={{ flex: "1", minWidth: "200px" }}
            />
            <Button
              type="button"
              variant="default"
              onClick={handleSaveEmail}
              disabled={savingEmail || !formData.email.trim()}
            >
              {savingEmail ? "Saving..." : "Save email"}
            </Button>
          </div>
        </FormGroup>

        <FormGroup>
          <Label>First name</Label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <Input
              type="text"
              value={formData.firstName}
              onChange={handleFirstNameChange}
              placeholder="First name"
              style={{ flex: "1", minWidth: "200px" }}
            />
            <Button
              type="button"
              variant="default"
              onClick={handleSaveFirstName}
              disabled={savingFirstName}
            >
              {savingFirstName ? "Saving..." : "Save name"}
            </Button>
          </div>
        </FormGroup>

        {message && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background:
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("saved") ||
                message.toLowerCase().includes("updated")
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("saved") ||
                message.toLowerCase().includes("updated")
                  ? "#15803d"
                  : "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              border:
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("saved") ||
                message.toLowerCase().includes("updated")
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
            }}
          >
            {message}
          </div>
        )}
      </Section>

      <Section>
        <DangerZone>
          <SectionTitle>Delete Account</SectionTitle>
          <SectionDescription>
            Permanently delete your account and all associated data
          </SectionDescription>

          <DangerItem>
            <DangerInfo>
              <DangerTitle>This action cannot be undone</DangerTitle>
              <DangerDescription>
                All your files, folders, and settings will be permanently
                deleted. This action is irreversible.
              </DangerDescription>
            </DangerInfo>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DangerItem>
        </DangerZone>
      </Section>
    </>
  );
};
