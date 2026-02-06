import React, { useState, useRef, useEffect, useCallback } from "react";
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
  GridTwo,
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
  updateProfile: (data: { email: string; firstName: string }) => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  settings,
  updateProfile,
}) => {
  const { deleteAccount } = useSettings();
  const [formData, setFormData] = useState({
    email: settings?.profile?.email || "",
    firstName: settings?.profile?.firstName || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(
    settings?.profile?.avatarUrl || null,
  );
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prefill form fields once settings have loaded
  useEffect(() => {
    if (!settings?.profile) return;

    const email = settings.profile.email || "";
    const firstName = settings.profile.firstName || "";

    // Always set initial values when settings load
    setFormData({
      email,
      firstName,
    });

    if (settings.profile.avatarUrl !== avatarUrl) {
      setAvatarUrl(settings.profile.avatarUrl || null);
    }

    if (!initialized) {
      setInitialized(true);
    }
  }, [settings]);

  // Autosave function with debouncing
  const autoSave = useCallback(
    async (data: { email: string; firstName: string }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          setSaving(true);
          await updateProfile(data);
          setMessage("Profile saved automatically");
          setTimeout(() => setMessage(""), 2000);
        } catch (error) {
          console.error("Autosave failed:", error);
          setMessage("Failed to save changes");
          setTimeout(() => setMessage(""), 3000);
        } finally {
          setSaving(false);
        }
      }, 1000); // 1 second debounce
    },
    [updateProfile],
  );

  // Handle field changes with autosave
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newFormData = { ...formData, email: newValue };
    setFormData(newFormData);
    autoSave(newFormData);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newFormData = { ...formData, firstName: newValue };
    setFormData(newFormData);
    autoSave(newFormData);
  };

  const handleSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    try {
      setLoading(true);
      setMessage("");
      await updateProfile(formData);
      setMessage("Profile updated successfully!");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      setMessage(message);
    } finally {
      setLoading(false);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
            // Fallback to initials if image fails to load
            console.error("Failed to load avatar:", avatarUrl);
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

        <GridTwo>
          <FormGroup>
            <Label>
              Email <span>*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="your@email.com"
            />
          </FormGroup>
          <FormGroup>
            <Label>
              First Name <span>*</span>
            </Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={handleFirstNameChange}
              placeholder="First name"
            />
          </FormGroup>
        </GridTwo>

        {message && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background:
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("saved")
                  ? "#dcfce7"
                  : "#fee2e2",
              color:
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("saved")
                  ? "#15803d"
                  : "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              border:
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("saved")
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {saving && <span>💾</span>}
            {message}
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading || saving}
        >
          {loading ? "Saving..." : saving ? "Saving..." : "Save Changes"}
        </Button>
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
