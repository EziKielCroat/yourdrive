import React from "react";
import { motion } from "framer-motion";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad } from "../landing/components/hero/styles/hero";
import { UsersIcon, CommentIcon } from "../shared/icons/IconSaxIcons";
import {
  TeamPermissionsIllustration,
  ShareLinkIllustration,
} from "../shared/illustrations/UseCaseIllustrations";
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
  HighlightBox,
} from "./styles/teamCollaboration";
import LandingButton from "../shared/landingbutton/LandingButton";

const TeamCollaboration: React.FC = () => {
  return (
    <>
      <Navbar_main />

      <PageContainer>
        <HeroSection
          as={motion.section}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroContent>
            <HeroTitle>
              Collaborate without
              <br />
              compromising privacy.
            </HeroTitle>
            <HeroSubtitle>
              Shared folders, real-time presence, and team-wide file access with
              granular permissions. All while keeping your data private and
              secure.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register">
              Start collaborating
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
              <UsersIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>File Sharing</FeatureTitle>
            <FeatureDescription>
              Share files and folders with team members. Control access
              permissions and collaborate seamlessly.
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
              <CommentIcon size={80} color="#1F9AFE" />
            </FeatureIcon>
            <FeatureTitle>File Comments</FeatureTitle>
            <FeatureDescription>
              Discuss shared files with comments. Leave feedback and collaborate
              on shared content.
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
          <SectionTitle>
            Manage access with precise role-based permissions
          </SectionTitle>
          <SectionDescription>
            Owner, editor, and viewer roles give you complete control over who
            can do what. Change permissions instantly without file copies.
          </SectionDescription>

          <div style={{ margin: "0 auto 60px", maxWidth: "900px" }}>
            <TeamPermissionsIllustration width={900} height={400} />
          </div>

          <CardsContainer>
            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <CardTitle>Three Permission Levels</CardTitle>
              <CardDescription>
                Owner has full control, Editor can modify files, Viewer has
                read-only access. Simple and effective.
              </CardDescription>
            </InfoCard>

            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle>Instant Permission Changes</CardTitle>
              <CardDescription>
                Update roles on the fly. Changes take effect immediately without
                disrupting team workflow.
              </CardDescription>
            </InfoCard>

            <InfoCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <CardTitle>Folder-Level Permissions</CardTitle>
              <CardDescription>
                Set permissions at the folder level. All files inside inherit
                the same access controls automatically.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <HighlightBox
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle style={{ marginBottom: "16px" }}>
            Stay in sync across all devices
          </SectionTitle>
          <SectionDescription style={{ marginBottom: "0" }}>
            Automatic synchronization keeps everyone on the same page. Changes
            appear instantly across desktop, mobile, and web.
          </SectionDescription>
        </HighlightBox>

        <ContentSection
          as={motion.section}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle>Track team activity with detailed feeds</SectionTitle>
          <SectionDescription>
            Activity feed shows all recent changes, edits, comments, and
            uploads. Never miss an important update from your team.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                See a chronological list of all team actions. Filter by user,
                file type, or date range for specific insights.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Mention Notifications</CardTitle>
              <CardDescription>
                Get notified when teammates mention you in comments. Stay
                informed without checking constantly.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>File Version History</CardTitle>
              <CardDescription>
                Track every change made to shared files. See who edited what and
                restore previous versions if needed.
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
          <SectionTitle>
            Collaborate with external partners securely
          </SectionTitle>
          <SectionDescription>
            Share specific files or folders with people outside your
            organization. Control their access level and revoke anytime.
          </SectionDescription>

          <div style={{ margin: "0 auto 60px", maxWidth: "800px" }}>
            <ShareLinkIllustration width={800} height={300} />
          </div>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Guest Access Links</CardTitle>
              <CardDescription>
                Create secure sharing links for external collaborators. They can
                access specific files without seeing your entire workspace.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Time-Limited Sharing</CardTitle>
              <CardDescription>
                Set expiration dates on shared links. Access automatically
                revokes after the specified time period.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Password Protection</CardTitle>
              <CardDescription>
                Add password protection to any share link for an extra layer of
                security on sensitive files.
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
