import React, { useState, useEffect } from "react";
import { HardDriveIcon as HardDrive, Trash2Icon as Trash2, RefreshCwIcon as RefreshCw, AlertTriangleIcon as AlertTriangle } from "../../shared/icons/index";
import styled from "styled-components";
import {
  Section,
  SectionTitle,
  SectionDescription,
  StorageBar,
  StorageFill,
  Button,
  ButtonGroup,
  InfoCard,
  InfoText,
  ToggleWrapper,
  ToggleInfo,
  ToggleTitle,
  ToggleDescription,
  Toggle,
  FormGroup,
  Label,
  Select,
  SmallText,
} from "../styles/settings.styles";
import api from "../../../lib/axios";
import type { UserSettings } from "../types/UserSettings";

interface StorageInfo {
  limit: string;
  used: string;
  available: string;
  usagePercentage: number;
  tier: string;
  deviceName: string;
}

type Props = {
  storage: UserSettings["storage"];
  updateStorage: (data: Partial<UserSettings["storage"]>) => Promise<void>;
};

export const StorageSection: React.FC<Props> = ({ storage, updateStorage }) => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [storageLoading, setStorageLoading] = useState(true);
  const [feedback, setFeedback] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const autoSync = storage.autoSync !== false;
  const fileVersioning = storage.fileVersioning !== false;
  const maxVersions = storage.maxVersionsToKeep ?? 10;

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
    if (percentage < 70) return "#10b981";
    if (percentage < 90) return "#f59e0b";
    return "#ef4444";
  };

  const persist = async (patch: Partial<UserSettings["storage"]>) => {
    setSaving(true);
    setFeedback("");
    try {
      await updateStorage(patch);
      setFeedback("Storage preferences saved.");
      setTimeout(() => setFeedback(""), 3000);
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (
      !confirm(
        "Clear locally cached file data on this device? Files stay in the cloud.",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/storage/clear-cache");
      setFeedback("Cache cleared.");
    } catch {
      setFeedback("Could not clear cache.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (
      !confirm(
        "Scan for duplicate files? This can take a while on large libraries.",
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/storage/remove-duplicates");
      setFeedback("Duplicate scan completed.");
      fetchStorageInfo();
    } catch {
      setFeedback("Duplicate scan failed.");
    } finally {
      setLoading(false);
    }
  };

  if (storageLoading) {
    return (
      <Section>
        <SectionTitle>Storage Usage</SectionTitle>
        <SectionDescription>Loading storage information...</SectionDescription>
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
          Monitor quota and how much of your plan is in use.
        </SectionDescription>

        {storageInfo?.tier && (
          <TierCard>
            <HardDrive size={20} color="#1F9AFE" />
            <div>
              <TierTitle>{storageInfo.tier}</TierTitle>
              <TierMeta>Current storage plan</TierMeta>
            </div>
          </TierCard>
        )}

        <UsageWrap>
          <UsageTop>
            <div>
              <UsageValue>{formatBytes(usedStorage)}</UsageValue>
              <UsageMeta>
                of {formatBytes(totalStorage)} used
                {storageInfo?.deviceName && ` on ${storageInfo.deviceName}`}
              </UsageMeta>
            </div>
            <UsagePct style={{ color: getUsageColor(usedPercentage) }}>
              {usedPercentage.toFixed(1)}%
            </UsagePct>
          </UsageTop>

          <StorageBar>
            <StorageFill
              $percentage={usedPercentage}
              color={getUsageColor(usedPercentage)}
            />
          </StorageBar>

          <StorageInfoRow>
            <span>{formatBytes(usedStorage)} used</span>
            <span>{formatBytes(availableStorage)} available</span>
          </StorageInfoRow>
        </UsageWrap>

        {usedPercentage > 80 && (
          <InfoCard
            style={{
              background: usedPercentage > 90 ? "#fef2f2" : "#fef3c7",
              border:
                usedPercentage > 90 ? "1px solid #fecaca" : "1px solid #fde68a",
            }}
          >
            <InfoText
              style={{ color: usedPercentage > 90 ? "#991b1b" : "#92400e" }}
            >
              <AlertTriangle
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              {usedPercentage > 90
                ? "Storage is almost full. Delete files or upgrade your plan."
                : "You are using most of your space. Consider freeing files or upgrading."}
            </InfoText>
          </InfoCard>
        )}
      </Section>

      <Section>
        <SectionTitle>Sync &amp; versions</SectionTitle>
        <SectionDescription>
          Controls how this app keeps data fresh and how many file versions are
          retained when versioning is on.
        </SectionDescription>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Background sync</ToggleTitle>
            <ToggleDescription>
              Periodically refresh folder listings and metadata while the app is
              open.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={autoSync}
            disabled={saving}
            onClick={() => void persist({ autoSync: !autoSync })}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>File versioning</ToggleTitle>
            <ToggleDescription>
              Keep prior versions when you replace files (subject to your plan
              limits).
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={fileVersioning}
            disabled={saving}
            onClick={() => void persist({ fileVersioning: !fileVersioning })}
          />
        </ToggleWrapper>

        <FormGroup>
          <Label>Versions to keep per file</Label>
          <Select
            value={String(maxVersions)}
            disabled={saving || !fileVersioning}
            onChange={(e) =>
              void persist({ maxVersionsToKeep: parseInt(e.target.value, 10) })
            }
          >
            {[3, 5, 10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} versions
              </option>
            ))}
          </Select>
          <SmallText>Older versions may be removed automatically when the limit is reached.</SmallText>
        </FormGroup>

        {feedback && (
          <InfoCard style={{ marginTop: "0.5rem" }}>
            <InfoText>{feedback}</InfoText>
          </InfoCard>
        )}
      </Section>

      <Section>
        <SectionTitle>Free up space</SectionTitle>
        <SectionDescription>
          Clear cached copies on this device or run a duplicate scan.
        </SectionDescription>

        <ButtonGroup>
          <Button onClick={handleClearCache} disabled={loading}>
            <Trash2 size={16} />
            Clear cache
          </Button>
          <Button onClick={handleRemoveDuplicates} disabled={loading}>
            <RefreshCw size={16} />
            Scan duplicates
          </Button>
        </ButtonGroup>

        <InfoCard style={{ marginTop: "1rem" }}>
          <InfoText>
            Clearing cache removes offline copies; files load again from the cloud
            when opened. Duplicate scan depends on server support.
          </InfoText>
        </InfoCard>
      </Section>
    </>
  );
};

const TierCard = styled.div`
  background: #f2f8ff;
  border: 1px solid #cfe5fb;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TierTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f9afe;
`;

const TierMeta = styled.div`
  font-size: 0.85rem;
  color: #60748a;
`;

const UsageWrap = styled.div`
  margin-bottom: 1.4rem;
`;

const UsageTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 12px;
`;

const UsageValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #17324c;
`;

const UsageMeta = styled.div`
  font-size: 0.85rem;
  color: #62758b;
`;

const UsagePct = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
`;

const StorageInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6a7d92;
`;
