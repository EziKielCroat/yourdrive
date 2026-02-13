import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  X,
  Link2,
  Mail,
  Lock,
  Calendar,
  Download,
  Eye,
  Edit3,
  MessageSquare,
  Copy,
  Check,
  Users,
  Globe,
  ChevronDown,
  Settings,
  Trash2,
} from "lucide-react";
import { useSettings } from "../../hooks/useSettings";
import api from "../../../../lib/axios";

interface SharePopupProps {
  fileId: string;
  fileName: string;
  onClose: () => void;
}

type Permission = "view" | "comment" | "edit" | "download";
type ShareType = "link" | "email" | "internal";

interface Share {
  id: string;
  token: string;
  url: string;
  permission: Permission;
  shareType: ShareType;
  hasPassword: boolean;
  expiresAt: string | null;
  maxDownloads: number | null;
  downloadCount: number;
  recipientCount: number;
  accessCount: number;
  createdAt: string;
}

interface Recipient {
  type: "user" | "email";
  value: string;
  permission?: Permission;
}

const SharePopup: React.FC<SharePopupProps> = ({
  fileId,
  fileName,
  onClose,
}) => {
  const { settings } = useSettings();

  const [activeTab, setActiveTab] = useState<"share" | "manage">("share");
  const [shareType, setShareType] = useState<ShareType>("link");
  const [permission, setPermission] = useState<Permission>("view");
  const [recipients, setRecipients] = useState<string>("");
  const [password, setPassword] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [maxDownloads, setMaxDownloads] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingShares, setExistingShares] = useState<Share[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Prefill from user's default share settings when popup opens
  useEffect(() => {
    if (!settings?.sharing) return;
    const s = settings.sharing as Record<string, unknown>;
    if (s.defaultLinkPermission && ["view", "comment", "edit", "download"].includes(String(s.defaultLinkPermission))) {
      setPermission(s.defaultLinkPermission as Permission);
    }
    if (s.defaultPassword) setPassword(String(s.defaultPassword));
    if (typeof s.defaultExpirationDays === "number") setExpiresIn(s.defaultExpirationDays * 24);
    if (typeof s.defaultDownloadLimit === "number") setMaxDownloads(s.defaultDownloadLimit);
  }, [settings]);

  useEffect(() => {
    fetchExistingShares();
  }, [fileId]);

  const fetchExistingShares = async () => {
    try {
      const response = await api.get(`/sharing/file/${fileId}`);
      const data = response.data;
      if (data.success) {
        setExistingShares(data.shares);
      }
    } catch (err) {
      console.error("Error fetching shares:", err);
    }
  };

  const handleCreateShare = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const recipientsList: Recipient[] = recipients
        .split(/[,\n]/)
        .map((r) => r.trim())
        .filter(Boolean)
        .map((value) => ({
          type: value.includes("@") ? "email" : "user",
          value,
          permission,
        }));

      const response = await api.post("/sharing/create", {
        fileId: parseInt(fileId),
        shareType,
        permission,
        password: password || undefined,
        expiresIn,
        maxDownloads,
        recipients: recipientsList.length > 0 ? recipientsList : undefined,
      });

      const data = response.data;

      if (data.success) {
        setSuccess(
          shareType === "link"
            ? "Share link created successfully!"
            : `File shared with ${recipientsList.length} recipient(s)!`,
        );
        await fetchExistingShares();

        // Only reset form if it's a link share
        if (shareType === "link") {
          setRecipients("");
          setPassword("");
          setExpiresIn(null);
          setMaxDownloads(null);
          setShowAdvanced(false);
        }

        // Auto-switch to manage tab after a delay
        setTimeout(() => {
          setActiveTab("manage");
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.error || "Failed to create share");
      }
    } catch (err) {
      console.error("Error creating share:", err);
      setError("Failed to create share. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await api.delete(`/sharing/${shareId}`);
      fetchExistingShares();
    } catch (err) {
      console.error("Error revoking share:", err);
    }
  };

  const getPermissionIcon = (perm: Permission) => {
    switch (perm) {
      case "view":
        return <Eye size={16} />;
      case "comment":
        return <MessageSquare size={16} />;
      case "edit":
        return <Edit3 size={16} />;
      case "download":
        return <Download size={16} />;
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            <Users size={20} />
            Share "{fileName}"
          </Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <TabBar>
          <Tab
            $active={activeTab === "share"}
            onClick={() => setActiveTab("share")}
          >
            Share
          </Tab>
          <Tab
            $active={activeTab === "manage"}
            onClick={() => setActiveTab("manage")}
          >
            Manage ({existingShares.length})
          </Tab>
        </TabBar>

        {activeTab === "share" && (
          <Content>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <Section>
              <SectionTitle>Share via</SectionTitle>
              <ShareTypeSelector>
                <ShareTypeOption
                  $active={shareType === "link"}
                  onClick={() => setShareType("link")}
                >
                  <Link2 size={18} />
                  <div>
                    <OptionTitle>Link</OptionTitle>
                    <OptionDesc>Anyone with the link</OptionDesc>
                  </div>
                </ShareTypeOption>
                <ShareTypeOption
                  $active={shareType === "email"}
                  onClick={() => setShareType("email")}
                >
                  <Mail size={18} />
                  <div>
                    <OptionTitle>Email</OptionTitle>
                    <OptionDesc>Send to specific people</OptionDesc>
                  </div>
                </ShareTypeOption>
              </ShareTypeSelector>
            </Section>

            {shareType === "email" && (
              <Section>
                <Label>
                  {shareType === "email" ? "Email addresses" : "Team members"}
                </Label>
                <Input
                  as="textarea"
                  rows={3}
                  placeholder={
                    shareType === "email"
                      ? "Enter email addresses, separated by commas or new lines"
                      : "Enter usernames or emails"
                  }
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                />
              </Section>
            )}

            <Section>
              <Label>Permission level</Label>
              <PermissionGrid>
                <PermissionCard
                  $active={permission === "view"}
                  onClick={() => setPermission("view")}
                >
                  <Eye size={18} />
                  <PermissionName>View only</PermissionName>
                </PermissionCard>
                <PermissionCard
                  $active={permission === "comment"}
                  onClick={() => setPermission("comment")}
                >
                  <MessageSquare size={18} />
                  <PermissionName>Comment</PermissionName>
                </PermissionCard>
                <PermissionCard
                  $active={permission === "edit"}
                  onClick={() => setPermission("edit")}
                >
                  <Edit3 size={18} />
                  <PermissionName>Edit</PermissionName>
                </PermissionCard>
                <PermissionCard
                  $active={permission === "download"}
                  onClick={() => setPermission("download")}
                >
                  <Download size={18} />
                  <PermissionName>Download</PermissionName>
                </PermissionCard>
              </PermissionGrid>
            </Section>

            <AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
              <Settings size={16} />
              Advanced options
              <ChevronDown
                size={16}
                style={{
                  transform: showAdvanced ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </AdvancedToggle>

            {showAdvanced && (
              <AdvancedSection>
                <AdvancedRow>
                  <AdvancedLabel>
                    <Lock size={16} />
                    Password protection
                  </AdvancedLabel>
                  <Input
                    type="password"
                    placeholder="Optional password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </AdvancedRow>

                <AdvancedRow>
                  <AdvancedLabel>
                    <Calendar size={16} />
                    Expiration
                  </AdvancedLabel>
                  <Select
                    value={expiresIn || ""}
                    onChange={(e) =>
                      setExpiresIn(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  >
                    <option value="">Never</option>
                    <option value="1">1 hour</option>
                    <option value="24">24 hours</option>
                    <option value="168">7 days</option>
                    <option value="720">30 days</option>
                  </Select>
                </AdvancedRow>

                <AdvancedRow>
                  <AdvancedLabel>
                    <Download size={16} />
                    Download limit
                  </AdvancedLabel>
                  <Input
                    type="number"
                    min="1"
                    placeholder="No limit"
                    value={maxDownloads || ""}
                    onChange={(e) =>
                      setMaxDownloads(
                        e.target.value ? parseInt(e.target.value) : null,
                      )
                    }
                  />
                </AdvancedRow>
              </AdvancedSection>
            )}

            <ActionButtons>
              <CancelButton onClick={onClose}>Cancel</CancelButton>
              <CreateButton onClick={handleCreateShare} disabled={loading}>
                {loading ? "Sharing..." : "Share"}
              </CreateButton>
            </ActionButtons>
          </Content>
        )}

        {activeTab === "manage" && (
          <Content>
            {existingShares.length === 0 ? (
              <EmptyState>
                <Globe size={48} color="#dadce0" />
                <EmptyText>No active shares</EmptyText>
                <EmptySubtext>Create a share link to get started</EmptySubtext>
              </EmptyState>
            ) : (
              <SharesList>
                {existingShares.map((share) => (
                  <ShareItem key={share.id}>
                    <ShareItemHeader>
                      <ShareItemInfo>
                        {getPermissionIcon(share.permission)}
                        <ShareItemTitle>
                          {share.shareType === "link"
                            ? "Anyone with link"
                            : `${share.recipientCount} recipient${
                                share.recipientCount !== 1 ? "s" : ""
                              }`}
                        </ShareItemTitle>
                      </ShareItemInfo>
                      <ShareItemActions>
                        <IconButton onClick={() => handleCopyUrl(share.url)}>
                          {copiedUrl === share.url ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </IconButton>
                        <IconButton onClick={() => handleRevokeShare(share.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </ShareItemActions>
                    </ShareItemHeader>
                    <ShareItemDetails>
                      <Detail>
                        {share.accessCount} view
                        {share.accessCount !== 1 ? "s" : ""}
                      </Detail>
                      {share.hasPassword && (
                        <Detail>
                          <Lock size={12} /> Protected
                        </Detail>
                      )}
                      {share.expiresAt && (
                        <Detail>
                          <Calendar size={12} /> Expires{" "}
                          {new Date(share.expiresAt).toLocaleDateString()}
                        </Detail>
                      )}
                    </ShareItemDetails>
                  </ShareItem>
                ))}
              </SharesList>
            )}
          </Content>
        )}
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.15s;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const TabBar = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
`;

const Tab = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => (p.$active ? "#111827" : "#6b7280")};
  cursor: pointer;
  border-bottom: 2px solid ${(p) => (p.$active ? "#3b82f6" : "transparent")};
  transition: all 0.15s;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  &:hover {
    color: #111827;
  }
`;

const Content = styled.div`
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const ShareTypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

const ShareTypeOption = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "#eff6ff" : "#f9fafb")};
  border: 1.5px solid ${(p) => (p.$active ? "#3b82f6" : "#e5e7eb")};
  border-radius: 8px;
  padding: 14px 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
  color: ${(p) => (p.$active ? "#3b82f6" : "#6b7280")};

  &:hover {
    background: ${(p) => (p.$active ? "#eff6ff" : "#f3f4f6")};
    border-color: ${(p) => (p.$active ? "#3b82f6" : "#d1d5db")};
  }

  svg {
    flex-shrink: 0;
  }
`;

const OptionTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  text-align: center;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const OptionDesc = styled.div`
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
  transition: all 0.15s;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
  cursor: pointer;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const PermissionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
`;

const PermissionCard = styled.button<{ $active: boolean }>`
  background: ${(p) => (p.$active ? "#eff6ff" : "#f9fafb")};
  border: 1.5px solid ${(p) => (p.$active ? "#3b82f6" : "#e5e7eb")};
  border-radius: 8px;
  padding: 14px 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.15s;
  color: ${(p) => (p.$active ? "#3b82f6" : "#6b7280")};

  &:hover {
    background: ${(p) => (p.$active ? "#eff6ff" : "#f3f4f6")};
    border-color: ${(p) => (p.$active ? "#3b82f6" : "#d1d5db")};
  }
`;

const PermissionName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: #111827;
  text-align: center;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const AdvancedToggle = styled.button`
  width: 100%;
  background: transparent;
  border: none;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #3b82f6;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  &:hover {
    background: #f3f4f6;
  }
`;

const AdvancedSection = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
  margin-bottom: 20px;
`;

const AdvancedRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AdvancedLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  &:hover {
    background: #f9fafb;
    color: #111827;
  }
`;

const CreateButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.15s;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SharesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ShareItem = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 14px;
`;

const ShareItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ShareItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b7280;
`;

const ShareItemTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const ShareItemActions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #6b7280;
  transition: all 0.15s;

  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const ShareItemDetails = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
`;

const Detail = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 14px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: #9ca3af;
  margin-top: 4px;
  font-family:
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
`;

export default SharePopup;
