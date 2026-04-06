import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
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

const FieldRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`;

const AlertMessage = styled.div<{ $success?: boolean }>`
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 0.95rem;
  border-radius: 10px;
  border: 1px solid ${(props) => (props.$success ? "#b8efc9" : "#ffd1d1")};
  background: ${(props) => (props.$success ? "#eafff0" : "#fff4f4")};
  color: ${(props) => (props.$success ? "#0f7c3a" : "#c23232")};
  font-size: 0.875rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

interface AccountSectionProps {
  settings: UserSettings | null;
  updateProfile: (data: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  settings,
  updateProfile,
}) => {
  const { deleteAccount, refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    email: settings?.profile?.email || "",
    firstName: settings?.profile?.firstName || "",
    lastName: settings?.profile?.lastName || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(
    settings?.profile?.avatarUrl || null,
  );
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingFirstName, setSavingFirstName] = useState(false);
  const [savingLastName, setSavingLastName] = useState(false);
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
      lastName: settings.profile.lastName || "",
    });
    setAvatarUrl(settings.profile.avatarUrl || null);
  }, [settings?.profile]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, firstName: e.target.value }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, lastName: e.target.value }));
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

  const handleSaveLastName = async () => {
    try {
      setSavingLastName(true);
      setMessage("");
      await updateProfile({ lastName: formData.lastName.trim() });
      setMessage("Last name saved");
      setTimeout(() => setMessage(""), 2500);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save last name",
      );
    } finally {
      setSavingLastName(false);
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
    const last = formData.lastName?.charAt(0).toUpperCase() || "";
    if (first && last) return `${first}${last}`;
    if (first) return first;
    if (last) return last;

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
          Update your identity details and profile avatar.
        </SectionDescription>

        <ProfilePictureWrapper>
          {getAvatarDisplay()}

          <div>
            <ButtonGroup>
              <Button
                type="button"
                  $variant="default"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar || removingAvatar}
              >
                {avatarUrl ? "Change avatar" : "Upload avatar"}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  $variant="danger"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar || removingAvatar}
                >
                  Remove
                </Button>
              )}
            </ButtonGroup>
            <SmallText>JPG, PNG, GIF or WebP. Max 5MB.</SmallText>
          </div>

          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
          />
        </ProfilePictureWrapper>

        <FormGroup>
          <Label>Email</Label>
          <FieldRow>
            <Input
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              style={{ flex: 1, minWidth: 220 }}
            />
            <Button
              type="button"
              $variant="default"
              onClick={handleSaveEmail}
              disabled={savingEmail || !formData.email.trim()}
            >
              {savingEmail ? "Saving..." : "Save email"}
            </Button>
          </FieldRow>
        </FormGroup>

        <FormGroup>
          <Label>First name</Label>
          <FieldRow>
            <Input
              type="text"
              value={formData.firstName}
              onChange={handleFirstNameChange}
              placeholder="First name"
              style={{ flex: 1, minWidth: 220 }}
            />
            <Button
              type="button"
              $variant="default"
              onClick={handleSaveFirstName}
              disabled={savingFirstName}
            >
              {savingFirstName ? "Saving..." : "Save"}
            </Button>
          </FieldRow>
        </FormGroup>

        <FormGroup>
          <Label>Last name</Label>
          <FieldRow>
            <Input
              type="text"
              value={formData.lastName}
              onChange={handleLastNameChange}
              placeholder="Last name"
              style={{ flex: 1, minWidth: 220 }}
            />
            <Button
              type="button"
              $variant="default"
              onClick={handleSaveLastName}
              disabled={savingLastName}
            >
              {savingLastName ? "Saving..." : "Save"}
            </Button>
          </FieldRow>
        </FormGroup>

        {message && (
          <AlertMessage
            $success={
              message.toLowerCase().includes("success") ||
              message.toLowerCase().includes("saved") ||
              message.toLowerCase().includes("updated")
            }
          >
            {message}
          </AlertMessage>
        )}
      </Section>

      <Section>
        <DangerZone>
          <SectionTitle>Delete Account</SectionTitle>
          <SectionDescription>
            Permanently remove your account and all associated data.
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
              $variant="danger"
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
