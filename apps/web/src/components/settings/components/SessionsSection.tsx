import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { Monitor, LogOut } from "lucide-react";
import { settingsService } from "../service/settingsService";
import type { ActiveSession } from "../types/UserSettings";
import {
  Section,
  SectionTitle,
  SectionDescription,
  Button,
  InfoCard,
  InfoText,
  SmallText,
} from "../styles/settings.styles";

const SessionList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SessionRow = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px solid #e4edf7;
  border-radius: 12px;
  background: #fbfdff;
`;

const SessionMeta = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
`;

const SessionTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #102033;
`;

const SessionDetail = styled.div`
  font-size: 0.8rem;
  color: #5c6b7d;
  margin-top: 2px;
`;

export const SessionsSection: React.FC = () => {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getActiveSessions();
      setSessions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRevoke = async (sessionId: string) => {
    if (!window.confirm("Sign out this session? You may need to log in again on that device.")) {
      return;
    }
    setRevokingId(sessionId);
    setError(null);
    try {
      await settingsService.signOutSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to revoke session.");
    } finally {
      setRevokingId(null);
    }
  };

  const formatTime = (d: Date | string) => {
    try {
      const date = typeof d === "string" ? new Date(d) : d;
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "—";
    }
  };

  return (
    <Section>
      <SectionTitle>Active sessions</SectionTitle>
      <SectionDescription>
        Devices and browsers where you are signed in. Revoke access you do not
        recognize.
      </SectionDescription>

      {loading && <SmallText>Loading sessions…</SmallText>}
      {error && (
        <InfoCard style={{ background: "#fff4f4", borderColor: "#ffd1d1" }}>
          <InfoText style={{ color: "#991b1b" }}>{error}</InfoText>
        </InfoCard>
      )}

      {!loading && !error && sessions.length === 0 && (
        <InfoCard>
          <InfoText>No other active sessions found.</InfoText>
        </InfoCard>
      )}

      {!loading && sessions.length > 0 && (
        <SessionList>
          {sessions.map((s) => (
            <SessionRow key={s.id}>
              <SessionMeta>
                <Monitor size={20} color="#1f9afe" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <SessionTitle>{s.deviceName || "Browser session"}</SessionTitle>
                  <SessionDetail>
                    {s.browser && `${s.browser} · `}
                    {s.os && `${s.os} · `}
                    {s.ipAddress && `${s.ipAddress} · `}
                    Last activity: {formatTime(s.lastActive)}
                  </SessionDetail>
                </div>
              </SessionMeta>
              <Button
                type="button"
                $variant="default"
                disabled={revokingId === s.id}
                onClick={() => handleRevoke(s.id)}
              >
                <LogOut size={14} style={{ marginRight: 6 }} />
                {revokingId === s.id ? "…" : "Revoke"}
              </Button>
            </SessionRow>
          ))}
        </SessionList>
      )}

      <SmallText style={{ marginTop: "0.75rem" }}>
        To end this browser session, use Log out in the top bar. Session list
        updates when you sign in elsewhere.
      </SmallText>
    </Section>
  );
};
