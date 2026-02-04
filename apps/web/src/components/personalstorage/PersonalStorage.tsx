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
  ImagePlaceholder
} from "./styles/personalStorage.ts";
import LandingButton from "../shared/landingbutton/LandingButton.tsx";

const PersonalStorage: React.FC = () => {
  return (
    <>
      <GlobalReset />
      <Navbar_main />

      <PageContainer>
        <HeroSection>
          <HeroContent>
            <HeroTitle>
              Your personal vault<br />
              for everything that matters.
            </HeroTitle>
            <HeroSubtitle>
              Store your documents, photos, videos, and files securely in one place. 
              Access them from anywhere, anytime, on any device.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register">Start for free</LandingButton>
          </HeroContent>
        </HeroSection>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>📁</FeatureIcon>
            <FeatureTitle>Unlimited Storage</FeatureTitle>
            <FeatureDescription>
              Store as many files as you need without worrying about running out of space.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Private & Secure</FeatureTitle>
            <FeatureDescription>
              Your files are encrypted and protected with enterprise-grade security measures.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>Access Anywhere</FeatureTitle>
            <FeatureDescription>
              Seamlessly access your files from desktop, mobile, or web browser.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <ContentSection>
          <SectionTitle>Keep your memories safe with intelligent organization</SectionTitle>
          <SectionDescription>
            Automatically organize your photos, documents, and files with smart folders 
            and AI-powered tagging. Never lose track of important files again.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <ImagePlaceholder>📊</ImagePlaceholder>
              <CardTitle>Smart Categories</CardTitle>
              <CardDescription>
                Automatically categorize your files by type, date, and content. 
                Find what you need in seconds with intelligent search.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>🎨</ImagePlaceholder>
              <CardTitle>Photo Albums</CardTitle>
              <CardDescription>
                Create beautiful photo albums with automatic date sorting and 
                face recognition to organize your precious memories.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>📄</ImagePlaceholder>
              <CardTitle>Document Scanning</CardTitle>
              <CardDescription>
                Scan physical documents with your phone and store them digitally. 
                Extract text and make everything searchable.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Backup your life automatically</SectionTitle>
          <SectionDescription>
            Set it and forget it. Automatic backup ensures your important files are 
            always safe, even if something happens to your device.
          </SectionDescription>

        </ContentSection>

        <ContentSection>
          <SectionTitle>Personalize your storage experience</SectionTitle>
          <SectionDescription>
            Customize folders, create shortcuts, and set up your workspace exactly 
            how you want it. Your storage, your way.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Custom Folders</CardTitle>
              <CardDescription>
                Create unlimited folders and subfolders to organize your content 
                in a way that makes sense to you.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>
                Pin your most-used files and folders for instant access. 
                Save time with smart shortcuts.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>File Versioning</CardTitle>
              <CardDescription>
                Never worry about losing changes. Keep multiple versions of 
                files and restore any previous version.
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

export default PersonalStorage;