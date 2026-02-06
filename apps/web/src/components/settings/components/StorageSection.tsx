import React, { useState, useEffect } from "react";
import { HardDrive, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import {
  Section,
  SectionTitle,
  SectionDescription,
  StorageBar,
  StorageFill,
  ToggleWrapper,
  ToggleInfo,
  ToggleTitle,
  ToggleDescription,
  Toggle,
  Button,
  ButtonGroup,
  InfoCard,
  InfoText,
} from "../styles/settings.styles";
import api from "../../../lib/axios";

interface StorageSectionProps {
  settings: any;
  updateStorage: (data: any) => Promise<void>; // FIXED: Changed from updateSettings to updateStorage
}

interface StorageInfo {
  limit: string;  // bytes as string
  used: string;   // bytes as string
  available: string; // bytes as string
  usagePercentage: number;
  tier: string;
  deviceName: string;
}

export const StorageSection: React.FC<StorageSectionProps> = ({
  settings,
  updateStorage, // FIXED: Changed from updateSettings to updateStorage
}) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(true);
  const [storageSettings, setStorageSettings] = useState<{
    autoSync: boolean;
    fileVersioning: boolean;
    maxVersionsToKeep: number;
    [key: string]: any;
  }>({
    autoSync: settings?.storage?.autoSync ?? true,
    fileVersioning: settings?.storage?.fileVersioning ?? true,
    maxVersionsToKeep: settings?.storage?.maxVersionsToKeep ?? 10,
  });

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  const fetchStorageInfo = async () => {
    try {
      setStorageLoading(true);
      const response = await api.get("/storage/info");
      
      if (response.data.success) {
        setStorageInfo({
          limit: response.data.limit,
          used: response.data.used,
          available: response.data.available,
          usagePercentage: response.data.usagePercentage,
          tier: response.data.tier,
          deviceName: response.data.deviceName,
        });
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
    } finally {
      setStorageLoading(false);
    }
  };

  const formatBytes = (bytes: string | number | bigint): string => {
    let bytesNum: number;
    
    if (typeof bytes === "bigint") {
      bytesNum = Number(bytes);
    } else if (typeof bytes === "string") {
      bytesNum = Number(bytes);
    } else {
      bytesNum = bytes;
    }
    
    if (bytesNum === 0) return "0 B";
    if (isNaN(bytesNum)) return "0 B";
    
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytesNum) / Math.log(k));
    
    return `${(bytesNum / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage < 70) return "#10b981"; // green
    if (percentage < 90) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const handleToggle = async (field: string) => {
    try {
      setLoading(true);
      const newValue = !storageSettings[field];
      
      // FIXED: Use updateStorage instead of updateSettings
      await updateStorage({ 
        [field]: newValue 
      });
      
      setStorageSettings((prev) => ({ ...prev, [field]: newValue }));
    } catch (error) {
      console.error("Failed to update storage setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the cache? This may affect offline access."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/storage/clear-cache");
      alert("Cache cleared successfully");
    } catch (error) {
      alert("Failed to clear cache");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (
      !confirm(
        "This will scan for and remove duplicate files. This may take some time."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/storage/remove-duplicates");
      alert("Duplicate files removed successfully");
      fetchStorageInfo(); // Refresh storage info
    } catch (error) {
      alert("Failed to remove duplicates");
    } finally {
      setLoading(false);
    }
  };

  const handleMaxVersionsChange = async (value: number) => {
    try {
      setLoading(true);
      
      // FIXED: Use updateStorage instead of updateSettings
      await updateStorage({ 
        maxVersionsToKeep: value 
      });
      
      setStorageSettings((prev) => ({ ...prev, maxVersionsToKeep: value }));
    } catch (error) {
      console.error("Failed to update max versions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (storageLoading) {
    return (
      <Section>
        <SectionTitle>Storage Usage</SectionTitle>
        <div>Loading storage information...</div>
      </Section>
    );
  }

  const usedPercentage = storageInfo?.usagePercentage || 0;
  const totalStorage = storageInfo ? BigInt(storageInfo.limit) : 0n;
  const usedStorage = storageInfo ? BigInt(storageInfo.used) : 0n;
  const availableStorage = storageInfo ? BigInt(storageInfo.available) : 0n;

  return (
    <>
      <Section>
        <SectionTitle>Storage Usage</SectionTitle>
        <SectionDescription>
          Monitor and manage your storage space
        </SectionDescription>

        {storageInfo?.tier && (
          <div style={{
            background: "#f0f9ff",
            border: "1px solid #1F9AFE",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <HardDrive size={20} color="#1F9AFE" />
            <div>
              <div style={{ fontWeight: 600, color: "#1F9AFE" }}>
                {storageInfo.tier}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                Current storage plan
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 700 }}>
                {formatBytes(usedStorage)}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                of {formatBytes(totalStorage)} used
                {storageInfo?.deviceName && ` on ${storageInfo.deviceName}`}
              </div>
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: getUsageColor(usedPercentage),
              }}
            >
              {usedPercentage.toFixed(1)}%
            </div>
          </div>

          <StorageBar>
            <StorageFill percentage={usedPercentage} color={getUsageColor(usedPercentage)} />
          </StorageBar>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#6b7280"
          }}>
            <span>{formatBytes(usedStorage)} used</span>
            <span>{formatBytes(availableStorage)} available</span>
          </div>
        </div>

        {usedPercentage > 80 && (
          <InfoCard
            style={{ 
              background: usedPercentage > 90 ? "#fef2f2" : "#fef3c7", 
              border: usedPercentage > 90 ? "1px solid #fecaca" : "1px solid #fde68a" 
            }}
          >
            <InfoText style={{ color: usedPercentage > 90 ? "#991b1b" : "#92400e" }}>
              <AlertTriangle
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              {usedPercentage > 90 
                ? "⚠️ Your storage is almost full! Please delete files or upgrade your plan."
                : "You're running low on storage space. Consider upgrading or deleting unused files."}
            </InfoText>
          </InfoCard>
        )}
      </Section>

      <Section>
        <SectionTitle>Storage Settings</SectionTitle>
        <SectionDescription>
          Configure how your files are stored and synced
        </SectionDescription>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Auto Sync</ToggleTitle>
            <ToggleDescription>
              Automatically sync files across all your devices
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={storageSettings.autoSync}
            onClick={() => handleToggle("autoSync")}
            disabled={loading}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>File Versioning</ToggleTitle>
            <ToggleDescription>
              Keep previous versions of modified files
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={storageSettings.fileVersioning}
            onClick={() => handleToggle("fileVersioning")}
            disabled={loading}
          />
        </ToggleWrapper>

        {storageSettings.fileVersioning && (
          <div style={{ marginTop: "1rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "#4b5563",
              fontWeight: 500
            }}>
              Max versions to keep per file
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="range"
                min="1"
                max="50"
                value={storageSettings.maxVersionsToKeep}
                onChange={(e) => handleMaxVersionsChange(parseInt(e.target.value))}
                disabled={loading}
                style={{
                  flex: 1,
                  height: "6px",
                  borderRadius: "3px",
                  background: "#e5e7eb",
                  outline: "none",
                  opacity: loading ? 0.6 : 1
                }}
              />
              <span style={{
                minWidth: "30px",
                textAlign: "center",
                fontWeight: 600,
                color: "#1F9AFE"
              }}>
                {storageSettings.maxVersionsToKeep}
              </span>
            </div>
          </div>
        )}
      </Section>

      <Section>
        <SectionTitle>Storage Management</SectionTitle>
        <SectionDescription>
          Free up space by managing cached files and versions
        </SectionDescription>

        <ButtonGroup>
          <Button onClick={handleClearCache} disabled={loading}>
            <Trash2 size={16} style={{ marginRight: "0.5rem" }} />
            Clear Cache
          </Button>
          <Button onClick={handleRemoveDuplicates} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: "0.5rem" }} />
            Remove Duplicates
          </Button>
        </ButtonGroup>

        <InfoCard style={{ marginTop: "1rem" }}>
          <InfoText>
            <strong>Note:</strong> Clearing cache will remove offline copies of
            your files. They will be re-downloaded when you access them next
            time.
          </InfoText>
        </InfoCard>
      </Section>
    </>
  );
};