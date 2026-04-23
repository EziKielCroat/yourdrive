import { useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import {
  UserIcon as User,
  ShieldIcon as Shield,
  SlidersHorizontalIcon as SlidersHorizontal,
  HardDriveIcon as HardDrive,
  Share2Icon as Share2,
  CheckCircle2Icon as CheckCircle2,
} from "../shared/icons/index";
import { useSettings } from "../shared/hooks/useSettings";
import SidebarToggle from "../dashboard/component/sidebar/SidebarToggle";

import { AccountSection } from "./components/AccountSection";
import { SecuritySection } from "./components/SecuritySection";
import { StorageSection } from "./components/StorageSection";
import { SharingSection } from "./components/SharingSection";
import { PreferencesNotificationsPrivacy } from "./components/PreferencesNotificationsPrivacy";

import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  PageWrapper,
  Container,
  Header,
  Title,
  Subtitle,
  TabsWrapper,
  TabsList,
  MobileTabsList,
  TabButton,
  MobileTabButton,
  MainContent,
  Section,
  SectionTitle,
  SectionDescription,
  FormGroup,
  Label,
  Select,
  GridTwo,
  SmallText,
  InfoCard,
  InfoText,
} from "./styles/settings.styles";

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CenterContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #5c6b7d;
`;

const SaveRow = styled.div`
  margin-top: 0.5rem;
`;

const SectionIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
`;

const MotionContent = styled(motion.div)`
  width: 100%;
`;

const SETTINGS_NAV_MQ = "(max-width: 768px)";

const Settings = () => {
  const isMobileSettingsNav = useMediaQuery(SETTINGS_NAV_MQ);
  const [activeTab, setActiveTab] = useState("account");
  const {
    settings,
    loading,
    error,
    updateProfile,
    updateSecurity,
    updateAppearance,
    updateLanguage,
    updatePreferences,
    updatePrivacy,
    updateStorage,
  } = useSettings();
  const [appearanceSaving, setAppearanceSaving] = useState(false);
  const [languageSaving, setLanguageSaving] = useState(false);
  const [appearanceSaved, setAppearanceSaved] = useState(false);
  const [languageSaved, setLanguageSaved] = useState(false);

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "sharing", label: "Sharing", icon: Share2 },
  ];

  const renderPreferences = () => {
    const appearance = settings?.appearance;
    const language = settings?.language;
    const hasData = Boolean(appearance);
    const hasLanguage = Boolean(language);

    const onChange = async (
      key: "theme" | "fileView" | "thumbnailQuality",
      value: string,
    ) => {
      if (!hasData) return;
      setAppearanceSaved(false);
      setAppearanceSaving(true);
      try {
        await updateAppearance({ [key]: value } as {
          theme?: "light" | "dark" | "system";
          fileView?: "grid" | "list" | "compact";
          thumbnailQuality?: "high" | "medium" | "low";
        });
        setAppearanceSaved(true);
        setTimeout(() => setAppearanceSaved(false), 2600);
      } finally {
        setAppearanceSaving(false);
      }
    };

    const onLanguageChange = async (
      key: "displayLanguage" | "dateFormat" | "timeFormat" | "timezone",
      value: string,
    ) => {
      if (!hasLanguage) return;
      setLanguageSaved(false);
      setLanguageSaving(true);
      try {
        await updateLanguage({ [key]: value } as {
          displayLanguage?: string;
          dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
          timeFormat?: "12-hour" | "24-hour";
          timezone?: string;
        });
        setLanguageSaved(true);
        setTimeout(() => setLanguageSaved(false), 2600);
      } finally {
        setLanguageSaving(false);
      }
    };

    return (
      <>
      <Section>
        <SectionTitle>
          <SectionIcon>
            <SlidersHorizontal size={17} />
          </SectionIcon>
          Appearance & Language
        </SectionTitle>
        <SectionDescription>
          Keep your workspace simple and readable with focused defaults.
        </SectionDescription>

        <GridTwo>
          <FormGroup>
            <Label>Theme</Label>
            <Select
              value={appearance?.theme ?? "system"}
              disabled={!hasData || appearanceSaving}
              onChange={(e) => onChange("theme", e.target.value)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>File view</Label>
            <Select
              value={appearance?.fileView ?? "grid"}
              disabled={!hasData || appearanceSaving}
              onChange={(e) => onChange("fileView", e.target.value)}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="compact">Compact</option>
            </Select>
          </FormGroup>
        </GridTwo>

        <FormGroup>
          <Label>Thumbnail quality</Label>
          <Select
            value={appearance?.thumbnailQuality ?? "medium"}
            disabled={!hasData || appearanceSaving}
            onChange={(e) => onChange("thumbnailQuality", e.target.value)}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </FormGroup>

        {appearanceSaved && (
          <InfoCard>
            <InfoText>
              <CheckCircle2 size={14} style={{ marginRight: 6 }} />
              Appearance preferences saved.
            </InfoText>
          </InfoCard>
        )}
      </Section>
      <Section>
        <SectionTitle>Region & Time</SectionTitle>
        <SectionDescription>
          Configure date and timezone behavior for consistent timestamps.
        </SectionDescription>

        <GridTwo>
          <FormGroup>
            <Label>Display language</Label>
            <Select
              value={language?.displayLanguage ?? "en"}
              disabled={!hasLanguage || languageSaving}
              onChange={(e) => onLanguageChange("displayLanguage", e.target.value)}
            >
              <option value="en">English</option>
              <option value="hr">Croatian</option>
              <option value="de">German</option>
              <option value="fr">French</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Date format</Label>
            <Select
              value={language?.dateFormat ?? "MM/DD/YYYY"}
              disabled={!hasLanguage || languageSaving}
              onChange={(e) => onLanguageChange("dateFormat", e.target.value)}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
          </FormGroup>
        </GridTwo>

        <GridTwo>
          <FormGroup>
            <Label>Time format</Label>
            <Select
              value={language?.timeFormat ?? "24-hour"}
              disabled={!hasLanguage || languageSaving}
              onChange={(e) => onLanguageChange("timeFormat", e.target.value)}
            >
              <option value="24-hour">24-hour</option>
              <option value="12-hour">12-hour</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Timezone</Label>
            <Select
              value={language?.timezone ?? "UTC"}
              disabled={!hasLanguage || languageSaving}
              onChange={(e) => onLanguageChange("timezone", e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="Europe/Zagreb">Europe/Zagreb</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="America/New_York">America/New_York</option>
            </Select>
          </FormGroup>
        </GridTwo>

        <SaveRow>
          <SmallText>
            Changes are applied immediately for your account.
          </SmallText>
        </SaveRow>

        {languageSaved && (
          <InfoCard>
            <InfoText>
              <CheckCircle2 size={14} style={{ marginRight: 6 }} />
              Language and region preferences saved.
            </InfoText>
          </InfoCard>
        )}
      </Section>

      {settings && (
        <PreferencesNotificationsPrivacy
          preferences={settings.preferences}
          privacy={settings.privacy}
          updatePreferences={updatePreferences}
          updatePrivacy={updatePrivacy}
        />
      )}
      </>
    );
  };

  const renderContent = () => {
    if (loading && !settings) {
      return <CenterContent>Loading settings...</CenterContent>;
    }

    if (error) {
      return (
        <InfoCard style={{ background: "#fff3f3", borderColor: "#ffd0d0" }}>
          <InfoText style={{ color: "#b42323" }}>
            <strong>Error:</strong> {error}
          </InfoText>
        </InfoCard>
      );
    }

    switch (activeTab) {
      case "account":
        return (
          <AccountSection settings={settings} updateProfile={updateProfile} />
        );

      case "security":
        return (
          <SecuritySection
            settings={settings}
            updateSecurity={updateSecurity}
          />
        );

      case "storage":
        return settings ? (
          <StorageSection
            storage={settings.storage}
            updateStorage={updateStorage}
          />
        ) : null;

      case "preferences":
        return renderPreferences();

      case "sharing":
        return <SharingSection />;

      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Header>
          <HeaderRow>
            <SidebarToggle />
            <Title>Settings</Title>
          </HeaderRow>
          <Subtitle>
            Manage your account, security, sharing, storage, and interface
            preferences in one consistent workspace.
          </Subtitle>
        </Header>

        <TabsWrapper
          $layout={isMobileSettingsNav ? "vertical" : "horizontal"}
        >
          {isMobileSettingsNav ? (
            <MobileTabsList>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <MobileTabButton
                    key={tab.id}
                    type="button"
                    $active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </MobileTabButton>
                );
              })}
            </MobileTabsList>
          ) : (
            <TabsList>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabButton
                    key={tab.id}
                    type="button"
                    $active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </TabButton>
                );
              })}
            </TabsList>
          )}
        </TabsWrapper>

        <MainContent>
          <AnimatePresence mode="wait" initial={false}>
            <MotionContent
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {renderContent()}
            </MotionContent>
          </AnimatePresence>
        </MainContent>
      </Container>
    </PageWrapper>
  );
};

export default Settings;
