import React, { useState, useRef } from "react";
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
  ContactEmail,
} from "../styles/settings.styles";
import { settingsService } from "../service/settingsService";

interface AccountSectionProps {
  settings: any;
  updateProfile: (data: any) => Promise<void>;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  settings,
  updateProfile,
}) => {
  const [formData, setFormData] = useState({
    email: settings?.profile?.email || "",
    firstName: settings?.profile?.firstName || "",
    lastName: settings?.profile?.lastName || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(settings?.profile?.avatarUrl || null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage("");
      await updateProfile(formData);
      setMessage("Profile updated successfully!");
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      setMessage(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
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
    } catch (error: any) {
      setMessage(error.message || "Failed to upload avatar");
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
    } catch (error: any) {
      setMessage(error.message || "Failed to remove avatar");
    } finally {
      setRemovingAvatar(false);
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.charAt(0).toUpperCase() || "";
    const last = formData.lastName?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "??";
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
          onError={(e) => {
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
          Update your name and email address
        </SectionDescription>

        <FormGroup>
          <Label>
            Email <span>*</span>
          </Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            placeholder="your@email.com"
          />
        </FormGroup>

        <GridTwo>
          <FormGroup>
            <Label>
              First Name <span>*</span>
            </Label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              placeholder="First name"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Last Name <span>*</span>
            </Label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              placeholder="Last name"
            />
          </FormGroup>
        </GridTwo>

        {message && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: message.toLowerCase().includes("success") 
                ? "#dcfce7" 
                : "#fee2e2",
              color: message.toLowerCase().includes("success") 
                ? "#15803d" 
                : "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              border: message.toLowerCase().includes("success")
                ? "1px solid #bbf7d0"
                : "1px solid #fecaca",
            }}
          >
            {message}
          </div>
        )}

        <Button variant="primary" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
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
                deleted. Please contact{" "}
                <ContactEmail>support@yourdrive.com</ContactEmail> to proceed.
              </DangerDescription>
            </DangerInfo>
          </DangerItem>
        </DangerZone>
      </Section>
    </>
  );
};