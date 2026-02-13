import React from "react";
import { motion } from "framer-motion";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
import LandingButton from "../shared/landingbutton/LandingButton";
import { LinkIcon, EditIcon, EyeIcon } from "../shared/icons/IconSaxIcons";
import { ShareLinkIllustration, CodeEditorIllustration } from "../shared/illustrations/UseCaseIllustrations";
import {
  PageContainer,
  HeroSection,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
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
  TwoColumnGrid
} from "./styles/fileSharingEditing";

const FileSharingEditing: React.FC = () => {
  return (
    <>
      <Navbar_main />
      <HeroContGradTop />

      <PageContainer>
        <HeroSection
          as={motion.section}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroContent>
            <HeroTitle>
              Share instantly.<br />
              Edit collaboratively.
            </HeroTitle>
            <HeroSubtitle>
              Generate secure sharing links in seconds. Edit text files, code, and 
              documents with built-in editors. All while maintaining complete privacy.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register">
              Try it now
            </LandingButton>
          </HeroContent>
        </HeroSection>

        <FeaturesGrid
          as={motion.div}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <FeatureCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FeatureIcon>
              <LinkIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>Instant Share Links</FeatureTitle>
            <FeatureDescription>
              Generate secure, time-limited sharing links with optional password 
              protection and download limits.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FeatureIcon>
              <EditIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>Built-In Editors</FeatureTitle>
            <FeatureDescription>
              Edit text files, Markdown, and code with syntax highlighting. Auto-save 
              keeps your work secure.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FeatureIcon>
              <EyeIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>Live Preview</FeatureTitle>
            <FeatureDescription>
              Preview images, PDFs, and Markdown with live rendering. No downloads 
              needed to view files.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <ContentSection
          as={motion.section}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Share with precision using flexible controls</SectionTitle>
          <SectionDescription>
            Set expiration dates, download limits, and password protection. Track who 
            accessed your files and revoke access anytime.
          </SectionDescription>

          <div style={{ margin: '0 auto 60px', maxWidth: '900px' }}>
            <ShareLinkIllustration width={900} height={400} />
          </div>

          <CardsContainer>
            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle>Time-Limited Access</CardTitle>
              <CardDescription>
                Set links to expire in 1 hour, 1 day, 1 week, or custom duration. 
                Access automatically revokes when time's up.
              </CardDescription>
            </InfoCard>

            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle>Download Limits</CardTitle>
              <CardDescription>
                Limit shares to one-time access, 5 downloads, or unlimited. Perfect for 
                controlling file distribution.
              </CardDescription>
            </InfoCard>

            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardTitle>Activity Tracking</CardTitle>
              <CardDescription>
                See views and downloads for every share link. Know exactly who's 
                accessing your files and when.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection
          as={motion.section}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Edit files directly in your browser</SectionTitle>
          <SectionDescription>
            Built-in editors for text, Markdown, and code with syntax highlighting. 
            Auto-save ensures you never lose work.
          </SectionDescription>

          <TwoColumnGrid>
            <InfoCard>
              <CardTitle>Text & Markdown Editor</CardTitle>
              <CardDescription>
                Full-featured editor with live Markdown preview. Perfect for documentation, 
                notes, and README files.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Code Editor</CardTitle>
              <CardDescription>
                Syntax highlighting for popular programming languages. Edit source code 
                with proper formatting and indentation.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Image Annotations</CardTitle>
              <CardDescription>
                Crop, rotate, and add text or arrows to images. Simple editing tools 
                built right in.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>PDF Viewer</CardTitle>
              <CardDescription>
                View PDFs with bookmarks, search, and navigation. No external apps 
                or downloads required.
              </CardDescription>
            </InfoCard>
          </TwoColumnGrid>
        </ContentSection>

        <ContentSection
          as={motion.section}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ margin: '0 auto 60px', maxWidth: '900px' }}>
            <CodeEditorIllustration width={900} height={350} />
          </div>

          <SectionTitle>Never lose work with version comparison</SectionTitle>
          <SectionDescription>
            Auto-saved drafts and complete version history. See what changed between 
            versions and restore any previous state.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Automatic Drafts</CardTitle>
              <CardDescription>
                Every edit auto-saves to drafts. Close your browser and pick up exactly 
                where you left off.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Version Comparison</CardTitle>
              <CardDescription>
                Side-by-side diff view shows exactly what changed. Track edits across 
                all versions of your files.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>One-Click Restore</CardTitle>
              <CardDescription>
                Restore any previous version with a single click. Undo unwanted changes 
                or recover deleted content.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection
          as={motion.section}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Share entire folders with public links</SectionTitle>
          <SectionDescription>
            Create public folders to share multiple files at once. Perfect for portfolios, 
            project deliverables, or resource libraries.
          </SectionDescription>

          <TwoColumnGrid>
            <InfoCard>
              <CardTitle>Public Folder Sharing</CardTitle>
              <CardDescription>
                Share entire directories with a single link. Recipients see all files 
                organized just like you do.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Revoke Anytime</CardTitle>
              <CardDescription>
                Instantly revoke access to any share link or public folder. Changes 
                take effect immediately.
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