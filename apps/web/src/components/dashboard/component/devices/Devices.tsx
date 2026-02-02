import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuthStore } from "../../../../store/authStore";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Trash2,
  Shield,
  MoreVertical,
  Edit3,
  Lock,
  Unlock,
  LogOut,
  AlertTriangle,
  X,
  Plus,
  Folder,
} from "lucide-react";
import SidebarToggle from "../sidebar/SidebarToggle";

interface Device {
  id: string;
  device_name: string;
  device_nickname?: string;
  device_type: string;
  browser: string;
  os: string;
  device_color: string;
  is_current: boolean;
  is_trusted: boolean;
  is_locked: boolean;
  lock_message?: string;
  sync_enabled: boolean;
  notifications_enabled: boolean;
  last_active: string;
  created_at: string;
  file_count: string | number;
  total_storage: string | number;
  pinned_count: string | number;
  offline_count: string | number;
  wiped_at?: string;
}

interface DeviceGroup {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  device_count: number;
  devices: Array<{
    device_id: string;
    device_name: string;
    device_type: string;
    is_current: boolean;
  }>;
}

const Devices: React.FC = () => {
  const token = useAuthStore((s) => s.accessToken);
  const [devices, setDevices] = useState<Device[]>([]);
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [remoteActionsModal, setRemoteActionsModal] = useState<Device | null>(
    null,
  );
  const [wipeConfirmModal, setWipeConfirmModal] = useState<Device | null>(null);
  const [lockModal, setLockModal] = useState<Device | null>(null);
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [showGroups, setShowGroups] = useState(false);
  const [addToGroupModal, setAddToGroupModal] = useState<Device | null>(null);
  const [selectedIcon, setSelectedIcon] = useState("📱");

  const iconOptions = [
    "📱",
    "💻",
    "🖥️",
    "⌚",
    "🎮",
    "📷",
    "🎧",
    "⌨️",
    "🖱️",
    "🔒",
    "🏢",
    "🏠",
    "✈️",
  ];

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
      toast.error("Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get("/api/devices/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data.groups || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDevices();
      fetchGroups();
    }
  }, [token]);

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "mobile":
        return <Smartphone size={20} />;
      case "tablet":
        return <Tablet size={20} />;
      case "desktop":
        return <Monitor size={20} />;
      default:
        return <Laptop size={20} />;
    }
  };

  const formatStorage = (bytes: number | string) => {
    const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
    if (isNaN(numBytes) || numBytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const parseCount = (value: string | number): number => {
    if (typeof value === "number") return value;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Active now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Remote Actions
  const handleForceLogout = async (device: Device) => {
    try {
      await axios.post(
        `/api/devices/${device.id}/actions/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Device will be logged out on next activity");
      setRemoteActionsModal(null);
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to logout device");
    }
  };

  const handleLockDevice = async (device: Device, message: string) => {
    try {
      await axios.post(
        `/api/devices/${device.id}/actions/lock`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Device locked successfully");
      setLockModal(null);
      setRemoteActionsModal(null);
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to lock device");
    }
  };

  const handleUnlockDevice = async (device: Device) => {
    try {
      await axios.post(
        `/api/devices/${device.id}/actions/unlock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Device unlocked successfully");
      setRemoteActionsModal(null);
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to unlock device");
    }
  };

  const handleWipeDevice = async (device: Device) => {
    try {
      await axios.post(
        `/api/devices/${device.id}/actions/wipe`,
        { confirmation: "WIPE" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Device wiped successfully");
      setWipeConfirmModal(null);
      setRemoteActionsModal(null);
      fetchDevices();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to wipe device");
    }
  };

  // Groups
  const handleCreateGroup = async (
    name: string,
    icon: string,
    color: string,
  ) => {
    try {
      await axios.post(
        "/api/devices/groups",
        { name, icon, color },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Group created successfully");
      setCreateGroupModal(false);
      fetchGroups();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Delete this group? Devices won't be affected.")) return;
    try {
      await axios.delete(`/api/devices/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Group deleted");
      fetchGroups();
    } catch (err: any) {
      toast.error("Failed to delete group");
    }
  };

  const handleAddToGroup = async (deviceId: string, groupId: number) => {
    try {
      await axios.post(
        `/api/devices/groups/${groupId}/devices/${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Device added to group");
      setAddToGroupModal(null);
      fetchGroups();
    } catch (err: any) {
      toast.error("Failed to add device to group");
    }
  };

  const filteredDevices = selectedGroup
    ? devices.filter((d) => {
        const group = groups.find((g) => g.id === selectedGroup);
        return group?.devices?.some((gd) => gd.device_id === d.id) || false;
      })
    : devices;

  if (loading) {
    return (
      <Container>
        <LoadingState>Loading devices...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <SidebarToggle />

          <Title>Devices</Title>
        </TitleSection>
        <HeaderActions>
          <ViewToggle>
            <ToggleButton
              $active={!showGroups}
              onClick={() => {
                setShowGroups(false);
                setSelectedGroup(null);
              }}
            >
              <Monitor size={16} />
              Devices ({devices.length})
            </ToggleButton>
            <ToggleButton
              $active={showGroups}
              onClick={() => setShowGroups(true)}
            >
              <Folder size={16} />
              Groups ({groups.length})
            </ToggleButton>
          </ViewToggle>
          {showGroups && (
            <CreateButton onClick={() => setCreateGroupModal(true)}>
              <Plus size={16} />
              New Group
            </CreateButton>
          )}
        </HeaderActions>
      </Header>

      {selectedGroup && (
        <GroupBreadcrumb>
          <BreadcrumbLink onClick={() => setSelectedGroup(null)}>
            All Groups
          </BreadcrumbLink>
          <span>/</span>
          <BreadcrumbCurrent>
            {groups.find((g) => g.id === selectedGroup)?.name}
          </BreadcrumbCurrent>
        </GroupBreadcrumb>
      )}

      {showGroups && !selectedGroup ? (
        <GroupsView>
          <GroupsGrid>
            {groups.map((group) => (
              <GroupCard key={group.id} $color={group.color}>
                <GroupHeader>
                  <GroupIcon>{group.icon}</GroupIcon>
                  <GroupInfo>
                    <GroupName>{group.name}</GroupName>
                    <GroupMeta>
                      {group.device_count} device
                      {group.device_count !== 1 && "s"}
                    </GroupMeta>
                  </GroupInfo>
                  <GroupActions>
                    <SmallButton onClick={() => setSelectedGroup(group.id)}>
                      View
                    </SmallButton>
                    <SmallButton
                      $danger
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 size={14} />
                    </SmallButton>
                  </GroupActions>
                </GroupHeader>
                {group.description && (
                  <GroupDescription>{group.description}</GroupDescription>
                )}
              </GroupCard>
            ))}
          </GroupsGrid>
        </GroupsView>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <TableRow $isHeader>
                <TableHeader style={{ width: "40%" }}>Device</TableHeader>
                <TableHeader style={{ width: "15%" }}>Status</TableHeader>
                <TableHeader style={{ width: "15%" }}>Files</TableHeader>
                <TableHeader style={{ width: "15%" }}>Storage</TableHeader>
                <TableHeader style={{ width: "15%" }}>Last Active</TableHeader>
                <TableHeader style={{ width: "50px" }}></TableHeader>
              </TableRow>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <TableRow
                  key={device.id}
                  onMouseEnter={() => setSettingsOpen(device.id)}
                  onMouseLeave={() => setSettingsOpen(null)}
                >
                  <TableCell>
                    <DeviceNameCell>
                      <DeviceIconWrapper
                        $color={device.device_color || "#1a73e8"}
                      >
                        {getDeviceIcon(device.device_type)}
                      </DeviceIconWrapper>
                      <DeviceNameWrapper>
                        <DeviceName>
                          {device.device_nickname || device.device_name}
                        </DeviceName>
                        <DeviceInfo>
                          {device.browser} • {device.os}
                        </DeviceInfo>
                      </DeviceNameWrapper>
                    </DeviceNameCell>
                  </TableCell>
                  <TableCell>
                    <StatusCell>
                      {device.is_current && (
                        <CurrentBadge>Current</CurrentBadge>
                      )}
                      {device.is_locked && (
                        <StatusBadge $color="#ea4335">
                          <Lock size={14} />
                          Locked
                        </StatusBadge>
                      )}
                      {device.is_trusted && !device.is_locked && (
                        <StatusBadge $color="#34a853">
                          <Shield size={14} />
                          Trusted
                        </StatusBadge>
                      )}
                    </StatusCell>
                  </TableCell>
                  <TableCell>
                    <StatValue>{parseCount(device.file_count || 0)}</StatValue>
                  </TableCell>
                  <TableCell>
                    <StatValue>
                      {formatStorage(device.total_storage || 0)}
                    </StatValue>
                  </TableCell>
                  <TableCell>
                    <LastActive>
                      {formatLastActive(device.last_active)}
                    </LastActive>
                  </TableCell>
                  <TableCell>
                    <ActionButtonWrapper>
                      {settingsOpen === device.id && (
                        <ActionButton
                          onClick={() => {
                            // Keep menu open
                          }}
                        >
                          <MoreVertical size={18} />
                        </ActionButton>
                      )}
                      {settingsOpen === device.id && (
                        <ActionsMenu onClick={(e) => e.stopPropagation()}>
                          <MenuItem
                            onClick={() => setRemoteActionsModal(device)}
                          >
                            <Shield size={16} />
                            Remote Actions
                          </MenuItem>
                          <MenuItem onClick={() => setAddToGroupModal(device)}>
                            <Folder size={16} />
                            Add to Group
                          </MenuItem>
                          <MenuItem onClick={() => setEditingDevice(device.id)}>
                            <Edit3 size={16} />
                            Rename
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem
                            $danger
                            onClick={() => {
                              /* handleRemoveDevice */
                            }}
                            disabled={device.is_current}
                          >
                            <Trash2 size={16} />
                            Remove Device
                          </MenuItem>
                        </ActionsMenu>
                      )}
                    </ActionButtonWrapper>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* Add to Group Modal */}
      {addToGroupModal && (
        <Modal onClick={() => setAddToGroupModal(null)}>
          <ModalContent $small onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Add to Group</ModalTitle>
              <CloseButton onClick={() => setAddToGroupModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <DeviceDetails>
              <DeviceName>
                {addToGroupModal.device_nickname || addToGroupModal.device_name}
              </DeviceName>
            </DeviceDetails>
            <GroupsList>
              {groups.map((group) => (
                <GroupOption
                  key={group.id}
                  onClick={() => handleAddToGroup(addToGroupModal.id, group.id)}
                >
                  <GroupIcon>{group.icon}</GroupIcon>
                  <GroupName>{group.name}</GroupName>
                </GroupOption>
              ))}
            </GroupsList>
          </ModalContent>
        </Modal>
      )}

      {/* Remote Actions Modal */}
      {remoteActionsModal && (
        <Modal onClick={() => setRemoteActionsModal(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Remote Device Actions</ModalTitle>
              <CloseButton onClick={() => setRemoteActionsModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <DeviceDetails>
              <DeviceName>
                {remoteActionsModal.device_nickname ||
                  remoteActionsModal.device_name}
              </DeviceName>
              <DeviceInfo>
                {remoteActionsModal.browser} • {remoteActionsModal.os}
              </DeviceInfo>
            </DeviceDetails>
            <ActionsList>
              {remoteActionsModal.is_locked ? (
                <ActionItem
                  onClick={() => handleUnlockDevice(remoteActionsModal)}
                >
                  <Unlock size={20} />
                  <ActionInfo>
                    <ActionTitle>Unlock Device</ActionTitle>
                    <ActionDesc>Allow access to files again</ActionDesc>
                  </ActionInfo>
                </ActionItem>
              ) : (
                <ActionItem onClick={() => setLockModal(remoteActionsModal)}>
                  <Lock size={20} />
                  <ActionInfo>
                    <ActionTitle>Lock Device</ActionTitle>
                    <ActionDesc>Prevent access to files</ActionDesc>
                  </ActionInfo>
                </ActionItem>
              )}
              {!remoteActionsModal.is_current && (
                <>
                  <ActionItem
                    onClick={() => handleForceLogout(remoteActionsModal)}
                  >
                    <LogOut size={20} />
                    <ActionInfo>
                      <ActionTitle>Force Logout</ActionTitle>
                      <ActionDesc>Sign out device remotely</ActionDesc>
                    </ActionInfo>
                  </ActionItem>
                  <ActionItem
                    $danger
                    onClick={() => setWipeConfirmModal(remoteActionsModal)}
                  >
                    <AlertTriangle size={20} />
                    <ActionInfo>
                      <ActionTitle>Remote Wipe</ActionTitle>
                      <ActionDesc>
                        Remove all synced files from device
                      </ActionDesc>
                    </ActionInfo>
                  </ActionItem>
                </>
              )}
            </ActionsList>
          </ModalContent>
        </Modal>
      )}

      {/* Wipe Confirmation Modal */}
      {wipeConfirmModal && (
        <Modal onClick={() => setWipeConfirmModal(null)}>
          <ModalContent $small onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>⚠️ Confirm Remote Wipe</ModalTitle>
              <CloseButton onClick={() => setWipeConfirmModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <WarningText>
              This will remove all synced files from this device. This action
              cannot be undone.
            </WarningText>
            <DeviceDetails>
              <DeviceName>
                {wipeConfirmModal.device_nickname ||
                  wipeConfirmModal.device_name}
              </DeviceName>
            </DeviceDetails>
            <ModalActions>
              <ModalButton onClick={() => setWipeConfirmModal(null)}>
                Cancel
              </ModalButton>
              <ModalButton
                $danger
                onClick={() => handleWipeDevice(wipeConfirmModal)}
              >
                <AlertTriangle size={16} />
                Wipe Device
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Lock Modal */}
      {lockModal && (
        <Modal onClick={() => setLockModal(null)}>
          <ModalContent $small onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Lock Device</ModalTitle>
              <CloseButton onClick={() => setLockModal(null)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const message = formData.get("message") as string;
                handleLockDevice(lockModal, message);
              }}
            >
              <InputGroup>
                <Label>Lock Message (Optional)</Label>
                <TextArea
                  name="message"
                  placeholder="This device has been locked..."
                  rows={3}
                />
              </InputGroup>
              <ModalActions>
                <ModalButton type="button" onClick={() => setLockModal(null)}>
                  Cancel
                </ModalButton>
                <ModalButton type="submit" $danger>
                  <Lock size={16} />
                  Lock Device
                </ModalButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Create Group Modal */}
      {createGroupModal && (
        <Modal onClick={() => setCreateGroupModal(false)}>
          <ModalContent $compact onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create Device Group</ModalTitle>
              <CloseButton onClick={() => setCreateGroupModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get("name") as string;
                const color = formData.get("color") as string;
                handleCreateGroup(name, selectedIcon, color || "#1a73e8");
              }}
            >
              <CompactInputRow>
                <IconPicker>
                  <IconPreview>{selectedIcon}</IconPreview>
                  <IconGrid>
                    {iconOptions.map((icon) => (
                      <IconOption
                        key={icon}
                        type="button"
                        $selected={selectedIcon === icon}
                        onClick={() => setSelectedIcon(icon)}
                      >
                        {icon}
                      </IconOption>
                    ))}
                  </IconGrid>
                </IconPicker>
                <InputGroup style={{ flex: 1 }}>
                  <Label>Group Name</Label>
                  <Input name="name" placeholder="Work Devices" required />
                </InputGroup>
              </CompactInputRow>
              <InputGroup>
                <Label>Color</Label>
                <ColorInputWrapper>
                  <ColorPreview>
                    <input
                      name="color"
                      type="color"
                      defaultValue="#1a73e8"
                      style={{ opacity: 0, position: "absolute" }}
                    />
                    <ColorSwatch
                      style={{
                        background:
                          (
                            document.querySelector(
                              'input[name="color"]',
                            ) as HTMLInputElement
                          )?.value || "#1a73e8",
                      }}
                    />
                  </ColorPreview>
                </ColorInputWrapper>
              </InputGroup>
              <ModalActions>
                <ModalButton
                  type="button"
                  onClick={() => setCreateGroupModal(false)}
                >
                  Cancel
                </ModalButton>
                <ModalButton type="submit">
                  <Plus size={16} />
                  Create Group
                </ModalButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Devices;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #202124;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 4px;
  background: #f1f3f4;
  padding: 4px;
  border-radius: 8px;
`;

const ToggleButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${(props) => (props.$active ? "#fff" : "transparent")};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "500" : "400")};
  color: ${(props) => (props.$active ? "#1a73e8" : "#5f6368")};
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: ${(props) =>
    props.$active ? "0 1px 2px rgba(0,0,0,0.1)" : "none"};

  &:hover {
    background: ${(props) =>
      props.$active ? "#fff" : "rgba(255,255,255,0.5)"};
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #1557b0;
  }
`;

const GroupBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #5f6368;
`;

const BreadcrumbLink = styled.span`
  color: #1a73e8;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbCurrent = styled.span`
  color: #202124;
  font-weight: 500;
`;

const TableContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  overflow: visible;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: visible;
`;

const TableRow = styled.tr<{ $isHeader?: boolean }>`
  border-bottom: 1px solid #e8eaed;
  transition: background 0.15s ease;

  ${(props) =>
    !props.$isHeader &&
    `
    &:hover {
      background: #f8f9fa;
    }
  `}

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8f9fa;
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #202124;
  vertical-align: middle;
  position: relative;
  overflow: visible;
`;

const DeviceNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DeviceIconWrapper = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DeviceNameWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DeviceName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
`;

const DeviceInfo = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const StatusCell = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: ${(props) => props.$color}15;
  color: ${(props) => props.$color};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const CurrentBadge = styled.div`
  padding: 4px 8px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const LastActive = styled.span`
  font-size: 13px;
  color: #5f6368;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #202124;
`;

const ActionButtonWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover {
    background: #f1f3f4;
  }
`;

const ActionsMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
  z-index: 100;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${(props) => (props.$danger ? "#ea4335" : "#202124")};
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;

  &:hover {
    background: ${(props) => (props.$danger ? "#fce8e6" : "#f1f3f4")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    color: ${(props) => (props.$danger ? "#ea4335" : "#5f6368")};
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #e8eaed;
  margin: 8px 0;
`;

const GroupsView = styled.div`
  width: 100%;
`;

const GroupsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const GroupCard = styled.div<{ $color: string }>`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 2px solid ${(props) => props.$color}30;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${(props) => props.$color};
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const GroupIcon = styled.div`
  font-size: 32px;
  line-height: 1;
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin: 0 0 4px 0;
`;

const GroupMeta = styled.div`
  font-size: 13px;
  color: #5f6368;
`;

const GroupActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button<{ $danger?: boolean }>`
  padding: 6px 12px;
  border: 1px solid ${(props) => (props.$danger ? "#ea4335" : "#e8eaed")};
  background: ${(props) => (props.$danger ? "#fce8e6" : "#fff")};
  color: ${(props) => (props.$danger ? "#ea4335" : "#202124")};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#ea4335" : "#f8f9fa")};
    color: ${(props) => (props.$danger ? "#fff" : "#202124")};
  }

  display: flex;
  align-items: center;
  gap: 4px;
`;

const GroupDescription = styled.p`
  font-size: 13px;
  color: #5f6368;
  margin: 12px 0 0 0;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  color: #5f6368;
  font-size: 16px;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $small?: boolean; $compact?: boolean }>`
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  max-width: ${(props) =>
    props.$small ? "400px" : props.$compact ? "480px" : "500px"};
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #202124;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f3f4;
  }
`;

const DeviceDetails = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 20px;
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionItem = styled.div<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${(props) => (props.$danger ? "#fce8e6" : "#f8f9fa")};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#fad2cf" : "#e8eaed")};
  }

  svg {
    color: ${(props) => (props.$danger ? "#ea4335" : "#5f6368")};
  }
`;

const ActionInfo = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 2px;
`;

const ActionDesc = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: #ea4335;
  background: #fce8e6;
  padding: 12px;
  border-radius: 8px;
  margin: 0 0 16px 0;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #202124;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  font-size: 14px;
  color: #202124;
  background: #fff;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  font-size: 14px;
  color: #202124;
  background: #fff;
  font-family: inherit;
  resize: vertical;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const ModalButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid ${(props) => (props.$danger ? "#ea4335" : "#e8eaed")};
  background: ${(props) => (props.$danger ? "#ea4335" : "#fff")};
  color: ${(props) => (props.$danger ? "#fff" : "#202124")};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$danger ? "#d33828" : "#f8f9fa")};
  }
`;

const GroupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const GroupOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #e8eaed;
  }
`;

const CompactInputRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const IconPicker = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IconPreview = styled.div`
  width: 60px;
  height: 60px;
  border: 2px solid #e8eaed;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: #f8f9fa;
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  max-width: 120px;
`;

const IconOption = styled.button<{ $selected?: boolean }>`
  width: 36px;
  height: 36px;
  border: 2px solid ${(props) => (props.$selected ? "#1a73e8" : "#e8eaed")};
  background: ${(props) => (props.$selected ? "#e8f0fe" : "#fff")};
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #1a73e8;
    background: #f8f9fa;
  }
`;

const ColorInputWrapper = styled.div`
  position: relative;
`;

const ColorPreview = styled.div`
  position: relative;
  width: 100%;
  height: 44px;
  cursor: pointer;
`;

const ColorSwatch = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  border: 2px solid #e8eaed;
`;
