import React, { useState, useEffect } from "react";
import { LockIcon as Lock, CalendarIcon as Calendar, DownloadIcon as Download, Share2Icon as Share2 } from "../../shared/icons/index";
import styled from "styled-components";
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
  Button,
} from "../styles/settings.styles";
import { settingsService } from "../service/settingsService";
import { useSettings } from "../../shared/hooks/useSettings";
import type { SharingDefaultsResponse } from "../types/UserSettings";

type FormState = {
  requirePasswordForLinks: boolean;
  defaultPassword: string;
  defaultExpirationDays: number | null;
  defaultDownloadLimit: number | null;
};

const defaultForm: FormState = {
  requirePasswordForLinks: false,
  defaultPassword: "",
  defaultExpirationDays: null,
  defaultDownloadLimit: null,
};

function toForm(s: SharingDefaultsResponse | null | undefined): FormState {
  if (!s || typeof s !== "object") return { ...defaultForm };
  return {
    requirePasswordForLinks: Boolean(s.requirePasswordForLinks),
    defaultPassword: typeof s.defaultPassword === "string" ? s.defaultPassword : "",
    defaultExpirationDays:
      s.defaultExpirationDays != null
        ? Number(s.defaultExpirationDays)
        : s.linkExpirationDays != null
          ? Number(s.linkExpirationDays)
          : null,
    defaultDownloadLimit:
      s.defaultDownloadLimit != null ? Number(s.defaultDownloadLimit) : null,
  };
}

export const SharingSection: React.FC = () => {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    settingsService
      .getSharing()
      .then((sharing) => {
        if (!cancelled) setForm(toForm(sharing));
      })
      .catch(() => {
        if (!cancelled) setFeedback({ type: "error", text: "Failed to load sharing options." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (field: keyof FormState, value: boolean | string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);
    try {
      const payload = {
        requirePasswordForLinks: form.requirePasswordForLinks,
        defaultPassword: form.defaultPassword.trim(),
        defaultExpirationDays: form.defaultExpirationDays,
        defaultDownloadLimit: form.defaultDownloadLimit,
      };
      const updated = await settingsService.updateSharing(payload);
      setForm(toForm(updated));
      await refreshSettings();
      setFeedback({ type: "success", text: "Default sharing options saved." });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <SectionTitle>Default sharing options</SectionTitle>
        <SectionDescription>Loading default sharing options...</SectionDescription>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>
        <Share2 size={18} />
        Default sharing options
      </SectionTitle>
      <SectionDescription>
        These options are used when you create a new share. Change any value below and click Save to apply.
      </SectionDescription>

      <form onSubmit={handleSubmit} noValidate>
        {/* A11y: optional username for password form */}
        <VisuallyHidden aria-hidden="true">
          <input type="text" name="username" autoComplete="username" tabIndex={-1} readOnly defaultValue=" " />
        </VisuallyHidden>

        <FormStack>
          <ToggleWrapper style={{ marginBottom: 0 }}>
            <ToggleInfo>
              <ToggleTitle>Require password for new links</ToggleTitle>
              <ToggleDescription>
                When on, new shared links will require a password. You can set a default below or leave it empty.
              </ToggleDescription>
            </ToggleInfo>
            <Toggle
              type="button"
              $active={form.requirePasswordForLinks}
              onClick={() => setField("requirePasswordForLinks", !form.requirePasswordForLinks)}
              disabled={saving}
            />
          </ToggleWrapper>

          <FormGroup>
            <Label htmlFor="sharing-default-password">
              <InlineIcon>
                <Lock size={16} />
              </InlineIcon>
              Default password (optional)
            </Label>
            <Input
              id="sharing-default-password"
              type="password"
              name="defaultPassword"
              autoComplete="new-password"
              placeholder="Leave empty to set per share"
              value={form.defaultPassword}
              onChange={(e) => setField("defaultPassword", e.target.value)}
              disabled={saving}
            />
            <SmallText>
              Used for new links when &quot;Require password&quot; is on. Empty = choose each time.
            </SmallText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="sharing-expiration">
              <InlineIcon>
                <Calendar size={16} />
              </InlineIcon>
              Default link expiration (days)
            </Label>
            <Select
              id="sharing-expiration"
              value={form.defaultExpirationDays != null ? String(form.defaultExpirationDays) : ""}
              onChange={(e) =>
                setField("defaultExpirationDays", e.target.value ? parseInt(e.target.value, 10) : null)
              }
              disabled={saving}
            >
              <option value="">No expiration</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </Select>
            <SmallText>
              New shared links expire after this many days.
            </SmallText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="sharing-download-limit">
              <InlineIcon>
                <Download size={16} />
              </InlineIcon>
              Default download limit
            </Label>
            <Input
              id="sharing-download-limit"
              type="number"
              min={1}
              placeholder="No limit"
              value={form.defaultDownloadLimit != null ? String(form.defaultDownloadLimit) : ""}
              onChange={(e) =>
                setField("defaultDownloadLimit", e.target.value ? parseInt(e.target.value, 10) : null)
              }
              disabled={saving}
            />
            <SmallText>
              Max downloads per link for new shares.
            </SmallText>
          </FormGroup>

          {feedback && (
            <Feedback role="alert" $type={feedback.type}>
              {feedback.text}
            </Feedback>
          )}

          <Button type="submit" $variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save default sharing options"}
          </Button>
        </FormStack>
      </form>
    </Section>
  );
};

const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 34rem;
`;

const InlineIcon = styled.span`
  display: inline-flex;
  margin-right: 0.45rem;
  vertical-align: middle;
`;

const Feedback = styled.div<{ $type: "success" | "error" }>`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid ${(props) => (props.$type === "success" ? "#b8efc9" : "#ffd1d1")};
  background: ${(props) => (props.$type === "success" ? "#eafff0" : "#fff4f4")};
  color: ${(props) => (props.$type === "success" ? "#15803d" : "#dc2626")};
  font-size: 0.875rem;
`;

const VisuallyHidden = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
`;
