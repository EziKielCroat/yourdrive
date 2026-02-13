import React from "react";
import { motion } from "framer-motion";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
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
} from "./styles/personalStorage";
import LandingButton from "../shared/landingbutton/LandingButton";
import { LockIcon, FolderIcon, DeviceIcon } from "../shared/icons/IconSaxIcons";
import { DragDropIllustration, ShieldLockIllustration } from "../shared/illustrations/UseCaseIllustrations";

const PersonalStorage: React.FC = () => {
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
              Your files, your rules.<br />
              Complete privacy guaranteed.
            </HeroTitle>
            <HeroSubtitle>
              Store your documents, photos, and files with true privacy. No tracking, 
              no data mining, no AI training on your content. Just secure, private storage.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register">
              Start for free
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
              <LockIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>Privacy-First Storage</FeatureTitle>
            <FeatureDescription>
              Your data is encrypted at rest and in transit. We can't access your files, 
              and neither can anyone else.
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
              <FolderIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>Smart Organization</FeatureTitle>
            <FeatureDescription>
              Nested folders, bulk operations, and powerful search make file 
              management effortless.
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
              <DeviceIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>Access Anywhere</FeatureTitle>
            <FeatureDescription>
              Access your files from any device with a web browser. Your files
              are always available when you need them.
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
          <SectionTitle>Upload and manage with drag-and-drop simplicity</SectionTitle>
          <SectionDescription>
            Chunked uploads for large files, resume interrupted uploads, and track 
            progress in real-time. File management has never been this smooth.
          </SectionDescription>

          <div style={{ margin: '0 auto 60px', maxWidth: '900px' }}>
            <DragDropIllustration width={900} height={400} />
          </div>

          <CardsContainer>
            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle>Instant File Preview</CardTitle>
              <CardDescription>
                View images, PDFs, and text files instantly without downloading. 
                Thumbnails generate automatically for quick browsing.
              </CardDescription>
            </InfoCard>

            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>
                Multi-select files for bulk download, delete, or move. Save time 
                with keyboard shortcuts and context menus.
              </CardDescription>
            </InfoCard>

            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardTitle>Storage Dashboard</CardTitle>
              <CardDescription>
                Monitor your storage quota with a visual dashboard. See what's 
                taking up space and optimize accordingly.
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
          <SectionTitle>Find anything instantly with powerful search</SectionTitle>
          <SectionDescription>
            Smart search with filters by date, type, size, and owner. Starred favorites 
            and recent files for quick access to what matters most.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Universal Search</CardTitle>
              <CardDescription>
                Search by filename across all your folders. Filter results by file type, 
                date modified, or size for precision.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Duplicate Detection</CardTitle>
              <CardDescription>
                Automatically detect duplicate files to free up storage space and 
                keep your library organized.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>30-Day Recovery</CardTitle>
              <CardDescription>
                Deleted files go to trash with 30-day recovery window. Restore 
                accidentally deleted content with one click.
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
          <SectionTitle>Your data stays yours, always</SectionTitle>
          <SectionDescription>
            Secure storage with access controls and audit logs. 
            Zero telemetry or analytics tracking.
          </SectionDescription>

          <div style={{ margin: '0 auto 60px', maxWidth: '800px' }}>
            <ShieldLockIllustration width={800} height={300} />
          </div>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                View complete access history for your files. Know exactly who accessed 
                what and when.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security with 2FA. Protect your account from 
                unauthorized access.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Data Retention Control</CardTitle>
              <CardDescription>
                You control your data retention policies. Export or delete your data 
                at any time.
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