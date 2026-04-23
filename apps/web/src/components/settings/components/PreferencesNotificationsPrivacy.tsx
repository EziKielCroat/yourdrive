import { useState } from "react";
import { BellIcon as Bell, ShieldIcon as Shield, CheckCircle2Icon as CheckCircle2 } from "../../shared/icons/index";
import type { UserSettings } from "../types/UserSettings";
import {
  Section,
  SectionTitle,
  SectionDescription,
  ToggleWrapper,
  ToggleInfo,
  ToggleTitle,
  ToggleDescription,
  Toggle,
  InfoCard,
  InfoText,
  SmallText,
} from "../styles/settings.styles";

type Props = {
  preferences: UserSettings["preferences"] | undefined;
  privacy: UserSettings["privacy"] | undefined;
  updatePreferences: (data: Partial<UserSettings["preferences"]>) => Promise<void>;
  updatePrivacy: (data: Partial<UserSettings["privacy"]>) => Promise<void>;
};

const getErr = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong. Try again.";

export function PreferencesNotificationsPrivacy({
  preferences,
  privacy,
  updatePreferences,
  updatePrivacy,
}: Props) {
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const p: Partial<UserSettings["preferences"]> = preferences ?? {};
  const pv: Partial<UserSettings["privacy"]> = privacy ?? {};

  const run = async (key: string, fn: () => Promise<void>) => {
    setSavingKey(key);
    setMsg(null);
    try {
      await fn();
      setMsg({ type: "ok", text: "Saved." });
      setTimeout(() => setMsg(null), 2200);
    } catch (e) {
      setMsg({ type: "err", text: getErr(e) });
    } finally {
      setSavingKey(null);
    }
  };

  const togglePref = async (
    field: keyof UserSettings["preferences"],
    next: boolean,
  ) => {
    if (
      field === "desktopNotifications" &&
      next &&
      typeof Notification !== "undefined"
    ) {
      if (Notification.permission === "default") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setMsg({
            type: "err",
            text: "Browser notifications were blocked. Enable them in your browser settings to use this.",
          });
          return;
        }
      } else if (Notification.permission === "denied") {
        setMsg({
          type: "err",
          text: "Notifications are blocked for this site. Change permission in the browser address bar or settings.",
        });
        return;
      }
    }
    await run(`pref-${String(field)}`, () =>
      updatePreferences({ [field]: next }),
    );
  };

  const togglePriv = async (
    field: keyof UserSettings["privacy"],
    next: boolean,
  ) => {
    await run(`priv-${String(field)}`, () => updatePrivacy({ [field]: next }));
  };

  const emailOn = p.emailNotifications !== false;
  const uploadOn = p.notifyOnUpload !== false;
  const shareOn = p.notifyOnShare !== false;
  const commentOn = p.notifyOnComment !== false;
  const onlineOn = pv.showOnlineStatus !== false;
  const activityOn = pv.allowActivityTracking !== false;
  const searchOn = pv.indexFilesForSearch !== false;

  return (
    <>
      <Section>
        <SectionTitle>
          <Bell size={17} />
          Notifications
        </SectionTitle>
        <SectionDescription>
          Choose which alerts you want. Email uses your account address; desktop
          uses the browser when allowed.
        </SectionDescription>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Email notifications</ToggleTitle>
            <ToggleDescription>
              Product updates, security notices, and file activity by email.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={emailOn}
            disabled={!!savingKey}
            onClick={() => togglePref("emailNotifications", !emailOn)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Desktop notifications</ToggleTitle>
            <ToggleDescription>
              Short alerts in this browser when something needs attention.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={!!p.desktopNotifications}
            disabled={!!savingKey}
            onClick={() => togglePref("desktopNotifications", !p.desktopNotifications)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Upload confirmations</ToggleTitle>
            <ToggleDescription>When uploads finish or fail.</ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={uploadOn}
            disabled={!!savingKey}
            onClick={() => togglePref("notifyOnUpload", !uploadOn)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Share activity</ToggleTitle>
            <ToggleDescription>When someone accepts or uses a link you shared.</ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={shareOn}
            disabled={!!savingKey}
            onClick={() => togglePref("notifyOnShare", !shareOn)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Comments</ToggleTitle>
            <ToggleDescription>When someone comments on a shared file.</ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={commentOn}
            disabled={!!savingKey}
            onClick={() => togglePref("notifyOnComment", !commentOn)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Weekly summary</ToggleTitle>
            <ToggleDescription>
              One digest email with storage and activity highlights.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={!!p.weeklyDigest}
            disabled={!!savingKey}
            onClick={() => togglePref("weeklyDigest", !p.weeklyDigest)}
          />
        </ToggleWrapper>

        <SmallText>
          In-app toasts always show for actions you take in this session.
        </SmallText>
      </Section>

      <Section>
        <SectionTitle>
          <Shield size={17} />
          Privacy
        </SectionTitle>
        <SectionDescription>
          Control how your account participates in search and product
          improvement.
        </SectionDescription>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Show online status</ToggleTitle>
            <ToggleDescription>
              Lets collaborators see when you are active in shared workspaces.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={onlineOn}
            disabled={!!savingKey}
            onClick={() => togglePriv("showOnlineStatus", !onlineOn)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Activity history</ToggleTitle>
            <ToggleDescription>
              Store recent actions to power “Recent” and recommendations.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={activityOn}
            disabled={!!savingKey}
            onClick={() => togglePriv("allowActivityTracking", !activityOn)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Share anonymous usage</ToggleTitle>
            <ToggleDescription>
              Helps us fix crashes and prioritize features. No file names or
              contents are included.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={!!pv.shareUsageData}
            disabled={!!savingKey}
            onClick={() => togglePriv("shareUsageData", !pv.shareUsageData)}
          />
        </ToggleWrapper>

        <ToggleWrapper>
          <ToggleInfo>
            <ToggleTitle>Search &amp; filters</ToggleTitle>
            <ToggleDescription>
              When off, name and filter search on the home dashboard are
              disabled for this account on this device.
            </ToggleDescription>
          </ToggleInfo>
          <Toggle
            type="button"
            $active={searchOn}
            disabled={!!savingKey}
            onClick={() => togglePriv("indexFilesForSearch", !searchOn)}
          />
        </ToggleWrapper>
      </Section>

      {msg && (
        <InfoCard
          style={
            msg.type === "err"
              ? { background: "#fff4f4", borderColor: "#ffd1d1" }
              : undefined
          }
        >
          <InfoText style={{ color: msg.type === "err" ? "#991b1b" : "#15803d" }}>
            {msg.type === "ok" && <CheckCircle2 size={14} style={{ marginRight: 6 }} />}
            {msg.text}
          </InfoText>
        </InfoCard>
      )}
    </>
  );
}
