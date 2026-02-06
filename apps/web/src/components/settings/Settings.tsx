import { useState } from "react";
import { User, Shield, Palette, Globe, HardDrive, Share2 } from "lucide-react";
import { useSettings } from "../shared/hooks/useSettings";
import SidebarToggle from "../dashboard/component/sidebar/SidebarToggle";

import { AccountSection } from "./components/AccountSection";
import { SecuritySection } from "./components/SecuritySection";
import { StorageSection } from "./components/StorageSection";
import { SharingSection } from "./components/SharingSection";

import {
  PageWrapper,
  Container,
  Header,
  Title,
  Subtitle,
  TabsWrapper,
  TabsList,
  TabButton,
  MainContent,
} from "./styles/settings.styles";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const {
    settings,
    loading,
    error,
    updateProfile,
    updateSecurity,
    updateAppearance,
    updateLanguage,
    updateStorage,
    updateSharing,
    deleteAccount,
  } = useSettings();

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language", icon: Globe },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "sharing", label: "Sharing", icon: Share2 },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem",
            color: "#536471",
          }}
        >
          Loading settings...
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            padding: "1.5rem",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
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
        return (
          <StorageSection settings={settings} updateStorage={updateStorage} />
        );

      case "appearance":
        return (
          <div style={{ padding: "1rem", color: "#536471" }}>
            Appearance settings coming soon...
          </div>
        );

      case "language":
        return (
          <div style={{ padding: "1rem", color: "#536471" }}>
            Language settings coming soon...
          </div>
        );

      case "sharing":
        return (
          <SharingSection settings={settings} updateSharing={updateSharing} />
        );

      default:
        return null;
    }
  };

  return (
    <PageWrapper>
      <Container>
        <Header>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <SidebarToggle />
            <Title>Settings</Title>
          </div>
          <Subtitle>Manage your account settings and preferences</Subtitle>
        </Header>

        <TabsWrapper>
          <TabsList>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </TabButton>
              );
            })}
          </TabsList>
        </TabsWrapper>

        <MainContent>{renderContent()}</MainContent>
      </Container>
    </PageWrapper>
  );
};

export default Settings;
