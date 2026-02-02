import React from "react";
import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
import LandingButton from "../shared/landingbutton/LandingButton.tsx";
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
  TwoColumnGrid
} from "./styles/fileSharingEditing.ts";

const FileSharingEditing: React.FC = () => {
  return (
    <>
      <GlobalReset />
      <Navbar_main />

      <PageContainer>
        <HeroSection>
          <HeroContent>
            <HeroTitle>
              Share files instantly.<br />
              Edit together effortlessly.
            </HeroTitle>
            <HeroSubtitle>
              Send files of any size with a simple link. Edit documents, spreadsheets, 
              and presentations in real-time with your team.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register" width={"20%"}>Try it now</LandingButton>
          </HeroContent>
        </HeroSection>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🔗</FeatureIcon>
            <FeatureTitle>Instant Sharing</FeatureTitle>
            <FeatureDescription>
              Generate secure links in seconds. Share with anyone, even if they don't have an account.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>✍️</FeatureIcon>
            <FeatureTitle>Live Editing</FeatureTitle>
            <FeatureDescription>
              Edit documents together in real-time. See changes as they happen with no refresh needed.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🎯</FeatureIcon>
            <FeatureTitle>Smart Permissions</FeatureTitle>
            <FeatureDescription>
              Control exactly what recipients can do - view only, comment, or full editing rights.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <ContentSection>
          <SectionTitle>Share files your way with flexible options</SectionTitle>
          <SectionDescription>
            Whether you're sharing with one person or thousands, we've got the perfect 
            sharing method for every scenario.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <ImagePlaceholder>🌐</ImagePlaceholder>
              <CardTitle>Public Links</CardTitle>
              <CardDescription>
                Create shareable links that anyone can access. Perfect for portfolios, 
                presentations, and public documents.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>🔐</ImagePlaceholder>
              <CardTitle>Password Protected</CardTitle>
              <CardDescription>
                Add an extra layer of security with password-protected links. Share 
                confidential files with peace of mind.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>⏰</ImagePlaceholder>
              <CardTitle>Expiring Links</CardTitle>
              <CardDescription>
                Set expiration dates for shared links. Automatically revoke access 
                after a specified time period.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Edit documents without the back-and-forth</SectionTitle>
          <SectionDescription>
            Collaborate on documents, spreadsheets, and presentations in real-time. 
            No more version confusion or endless email attachments.
          </SectionDescription>

          <TwoColumnGrid>
            <InfoCard>
              <CardTitle>Document Editor</CardTitle>
              <CardDescription>
                Full-featured text editor with formatting, comments, and suggestions. 
                Works seamlessly across all devices.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Spreadsheet Tools</CardTitle>
              <CardDescription>
                Powerful spreadsheet editor with formulas, charts, and data validation. 
                Perfect for financial reports and data analysis.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Presentation Builder</CardTitle>
              <CardDescription>
                Create stunning presentations with templates, animations, and 
                collaboration features built right in.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Code Editor</CardTitle>
              <CardDescription>
                Syntax highlighting and collaboration for developers. Edit code files 
                together with your team in real-time.
              </CardDescription>
            </InfoCard>
          </TwoColumnGrid>
        </ContentSection>

        <ContentSection>
          <ImagePlaceholder style={{ height: '350px', margin: '0 auto 60px' }}>
            ✏️ Real-Time Collaboration Interface
          </ImagePlaceholder>

          <SectionTitle>Track every change with detailed version history</SectionTitle>
          <SectionDescription>
            Never lose work again. See who changed what, when they changed it, 
            and restore any previous version with one click.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Automatic Saving</CardTitle>
              <CardDescription>
                Every change is saved automatically. Focus on your work without 
                worrying about losing progress.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Change Tracking</CardTitle>
              <CardDescription>
                See exactly what changed between versions. Review edits and understand 
                the evolution of your documents.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>One-Click Restore</CardTitle>
              <CardDescription>
                Easily roll back to any previous version. Undo unwanted changes or 
                recover deleted content instantly.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Share large files without limits</SectionTitle>
          <SectionDescription>
            Send videos, design files, and large datasets without compression or quality loss. 
            No file size restrictions, ever.
          </SectionDescription>

          <TwoColumnGrid>
            <InfoCard>
              <CardTitle>No Size Limits</CardTitle>
              <CardDescription>
                Share files of any size. From tiny documents to 4K videos and large 
                design projects - we handle it all.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Fast Upload Speed</CardTitle>
              <CardDescription>
                Optimized upload technology gets your files shared faster. Resume 
                interrupted uploads automatically.
              </CardDescription>
            </InfoCard>
          </TwoColumnGrid>
        </ContentSection>
      </PageContainer>

      <HeroContGrad style={{ transform: "rotate(180deg)" }} />
      <Footer />
    </>
  );
};

export default FileSharingEditing;