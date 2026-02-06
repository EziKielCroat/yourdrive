import React, { useState, useEffect } from "react";
import { Lock, Calendar, Download } from "lucide-react";
import {
  Section,
  SectionTitle,
  SectionDescription,
  FormGroup,
  Label,
  Input,
  Select,
  ToggleWrapper,
  ToggleInfo,
  ToggleTitle,
  ToggleDescription,
  Toggle,
  SmallText,
} from "../styles/settings.styles";

interface SharingSectionProps {
  settings: any;
  updateSharing: (data: Record<string, unknown>) => Promise<void>;
}

export const SharingSection: React.FC<SharingSectionProps> = ({
  settings,
  updateSharing,
}) => {
  const [sharingSettings, setSharingSettings] = useState({
    defaultPassword: settings?.sharing?.defaultPassword || "",
    defaultExpirationDays: settings?.sharing?.defaultExpirationDays || null,
    defaultDownloadLimit: settings?.sharing?.defaultDownloadLimit || null,
    requirePasswordForLinks:
      settings?.sharing?.requirePasswordForLinks || false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings?.sharing) {
      setSharingSettings({
        defaultPassword: settings.sharing.defaultPassword || "",
        defaultExpirationDays: settings.sharing.defaultExpirationDays || null,
        defaultDownloadLimit: settings.sharing.defaultDownloadLimit || null,
        requirePasswordForLinks:
          settings.sharing.requirePasswordForLinks || false,
      });
    }
  }, [settings]);

  const handleToggle = async (field: string) => {
    try {
      setLoading(true);
      const newValue = !sharingSettings[field as keyof typeof sharingSettings];
      const updatedSettings = { ...sharingSettings, [field]: newValue };

      await updateSharing({
        [field]: newValue,
      });

      setSharingSettings(updatedSettings);
    } catch (error) {
      console.error("Failed to update sharing settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = async (
    field: string,
    value: string | number | null,
  ) => {
    try {
      setLoading(true);
      const updatedSettings = { ...sharingSettings, [field]: value };

      await updateSharing({
        [field]: value,
      });

      setSharingSettings(updatedSettings);
    } catch (error) {
      console.error("Failed to update sharing settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Section>
        <SectionTitle>Default Sharing Settings</SectionTitle>
        <SectionDescription>
          Configure default options for sharing files. These settings will be
          used when creating new shares.
        </SectionDescription>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Require Password for Links</ToggleTitle>
            <ToggleDescription>
              Automatically require a password for all shared links
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={sharingSettings.requirePasswordForLinks}
            onClick={() => handleToggle("requirePasswordForLinks")}
            disabled={loading}
          />
        </ToggleWrapper>

        <FormGroup>
          <Label>
            <Lock
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Default Password
          </Label>
          <Input
            type="password"
            placeholder="Leave empty to disable default password"
            value={sharingSettings.defaultPassword}
            onChange={(e) =>
              handleFieldChange("defaultPassword", e.target.value)
            }
            disabled={loading}
          />
          <SmallText style={{ marginTop: "0.5rem", color: "#536471" }}>
            This password will be automatically applied to new shared links
          </SmallText>
        </FormGroup>

        <FormGroup>
          <Label>
            <Calendar
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Default Expiration (days)
          </Label>
          <Select
            value={sharingSettings.defaultExpirationDays || ""}
            onChange={(e) =>
              handleFieldChange(
                "defaultExpirationDays",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            disabled={loading}
          >
            <option value="">Never expire</option>
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </Select>
          <SmallText style={{ marginTop: "0.5rem", color: "#536471" }}>
            Shared links will automatically expire after this period
          </SmallText>
        </FormGroup>

        <FormGroup>
          <Label>
            <Download
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Default Download Limit
          </Label>
          <Input
            type="number"
            min="1"
            placeholder="No limit"
            value={sharingSettings.defaultDownloadLimit || ""}
            onChange={(e) =>
              handleFieldChange(
                "defaultDownloadLimit",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            disabled={loading}
          />
          <SmallText style={{ marginTop: "0.5rem", color: "#536471" }}>
            Maximum number of downloads allowed for shared links
          </SmallText>
        </FormGroup>
      </Section>
    </>
  );
};
