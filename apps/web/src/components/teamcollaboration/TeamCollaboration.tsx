import React from "react";
import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
import {
  PageContainer,
  HeroSection,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  CTAButton,
  FeaturesGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
  ContentSection,
  SectionTitle,
  SectionDescription,
  CardsContainer,
  InfoCard,
  CardTitle,
  CardDescription,
  ImagePlaceholder,
  HighlightBox
} from "./styles/teamCollaboration.ts";
import LandingButton from "../shared/landingbutton/LandingButton.tsx";

const TeamCollaboration: React.FC = () => {
  return (
    <>
      <GlobalReset />
      <Navbar_main />

      <PageContainer>
        <HeroSection>
          <HeroContent>
            <HeroTitle>
              Collaborate seamlessly<br />
              with your entire team.
            </HeroTitle>
            <HeroSubtitle>
              Work together in real-time, share files instantly, and keep everyone 
              on the same page. Built for teams that move fast.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register">Start collaborating</LandingButton>
          </HeroContent>
        </HeroSection>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>👥</FeatureIcon>
            <FeatureTitle>Team Workspaces</FeatureTitle>
            <FeatureDescription>
              Create dedicated spaces for each project with customizable permissions and access controls.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>⚡</FeatureIcon>
            <FeatureTitle>Real-Time Sync</FeatureTitle>
            <FeatureDescription>
              Everyone sees the latest version instantly. No more confusion about which file is current.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💬</FeatureIcon>
            <FeatureTitle>Built-in Comments</FeatureTitle>
            <FeatureDescription>
              Discuss files directly with threaded comments. Keep all feedback in context.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <ContentSection>
          <SectionTitle>Work together in real-time with powerful collaboration tools</SectionTitle>
          <SectionDescription>
            See who's working on what, track changes, and collaborate seamlessly 
            without ever leaving your workflow.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <ImagePlaceholder>👀</ImagePlaceholder>
              <CardTitle>Live Presence</CardTitle>
              <CardDescription>
                See who's viewing or editing files in real-time. Know when teammates 
                are active and available to collaborate.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>✏️</ImagePlaceholder>
              <CardTitle>Co-Editing</CardTitle>
              <CardDescription>
                Multiple team members can edit documents simultaneously. Changes 
                sync instantly without conflicts.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>📝</ImagePlaceholder>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>
                Stay updated with a central feed showing all team activity, edits, 
                comments, and file uploads.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <HighlightBox>
          <SectionTitle style={{ marginBottom: '16px' }}>
            Streamline team communication and file management
          </SectionTitle>
          <SectionDescription style={{ marginBottom: '0' }}>
            Eliminate endless email chains and scattered files. Everything your team 
            needs is organized in one central hub.
          </SectionDescription>
        </HighlightBox>

        <ContentSection>
          <SectionTitle>Manage permissions and access with precision</SectionTitle>
          <SectionDescription>
            Control who can view, edit, or share files. Set up teams, assign roles, 
            and manage access at scale.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Assign roles like Admin, Editor, or Viewer. Each role has specific 
                permissions to keep your data secure.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Team Folders</CardTitle>
              <CardDescription>
                Create folders that automatically grant access to specific teams. 
                New members get instant access to relevant files.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Guest Access</CardTitle>
              <CardDescription>
                Invite external collaborators with limited permissions. They can 
                access specific files without seeing your entire workspace.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Track progress and stay aligned</SectionTitle>
          <SectionDescription>
            Monitor team activity, track file versions, and ensure everyone is 
            working towards the same goals.
          </SectionDescription>

          <ImagePlaceholder style={{ height: '300px', margin: '40px auto' }}>
            📊 Team Analytics Dashboard
          </ImagePlaceholder>

          <CardsContainer style={{ marginTop: '40px' }}>
            <InfoCard>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                See every change made to files. Restore previous versions if needed 
                and track who made what changes.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Task Integration</CardTitle>
              <CardDescription>
                Link files to tasks and projects. Keep everything connected and 
                easily find related documents.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Team Reports</CardTitle>
              <CardDescription>
                Get insights into team productivity, storage usage, and collaboration 
                patterns with detailed analytics.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>
      </PageContainer>

      <HeroContGrad style={{ transform: "rotate(180deg)" }} />
      <Footer />
    </>
  );
};

export default TeamCollaboration;