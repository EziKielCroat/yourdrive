import { useState } from "react";
import styled from "styled-components";
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

const ComingSoonCard = styled.div`
  background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2.5rem;
  text-align: center;
  max-width: 420px;
  margin: 0 auto;
`;
const ComingSoonIcon = styled.div`
  color: #94a3b8;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;
const ComingSoonTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
`;
const ComingSoonText = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
`;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const {
    settings,
    loading,
    error,
    updateProfile,
    updateSecurity,
    updateStorage,
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
    if (loading && !settings) {
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
        return settings ? (
          <StorageSection settings={settings} updateStorage={updateStorage} />
        ) : null;

      case "appearance":
        return (
          <ComingSoonCard>
            <ComingSoonIcon>
              <Palette size={40} strokeWidth={1.2} />
            </ComingSoonIcon>
            <ComingSoonTitle>Appearance</ComingSoonTitle>
            <ComingSoonText>
              Theme, file view, and display options are coming soon.
            </ComingSoonText>
          </ComingSoonCard>
        );

      case "language":
        return (
          <ComingSoonCard>
            <ComingSoonIcon>
              <Globe size={40} strokeWidth={1.2} />
            </ComingSoonIcon>
            <ComingSoonTitle>Language & region</ComingSoonTitle>
            <ComingSoonText>
              Display language, date and time format are coming soon.
            </ComingSoonText>
          </ComingSoonCard>
        );

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
