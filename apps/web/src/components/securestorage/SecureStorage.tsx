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
  SecurityBadge,
  BadgesContainer
} from "./styles/secureStorage.ts";
import LandingButton from "../shared/landingbutton/LandingButton.tsx";

const SecureStorage: React.FC = () => {
  return (
    <>
      <GlobalReset />
      <Navbar_main />

      <PageContainer>
        <HeroSection>
          <HeroContent>
            <HeroTitle>
              Enterprise-grade security<br />
              for your most important files.
            </HeroTitle>
            <HeroSubtitle>
              Bank-level encryption, zero-knowledge architecture, and compliance with 
              global security standards. Your data is protected at every level.
            </HeroSubtitle>
            <LandingButton variant="primary" size="lg" purp="register" width={"35%"}>Explore security features</LandingButton>
          </HeroContent>
        </HeroSection>

        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🔐</FeatureIcon>
            <FeatureTitle>End-to-End Encryption</FeatureTitle>
            <FeatureDescription>
              Your files are encrypted before leaving your device. Only you have the keys to decrypt them.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Advanced Threat Protection</FeatureTitle>
            <FeatureDescription>
              AI-powered security monitors for threats 24/7 and blocks suspicious activity automatically.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📋</FeatureIcon>
            <FeatureTitle>Compliance Ready</FeatureTitle>
            <FeatureDescription>
              Meet industry standards including HIPAA, GDPR, SOC 2, and ISO 27001 certifications.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>

        <ContentSection>
          <SectionTitle>Military-grade encryption at rest and in transit</SectionTitle>
          <SectionDescription>
            Every file is protected with AES-256 encryption - the same standard used by 
            banks and governments. Your data is secure from the moment it leaves your device.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <ImagePlaceholder>🔒</ImagePlaceholder>
              <CardTitle>Zero-Knowledge Architecture</CardTitle>
              <CardDescription>
                We can't access your files even if we wanted to. Your encryption keys 
                are generated on your device and never sent to our servers.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>🌐</ImagePlaceholder>
              <CardTitle>Secure File Transfer</CardTitle>
              <CardDescription>
                All data transmission uses TLS 1.3 protocol. Your files are protected 
                from interception during upload and download.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <ImagePlaceholder>💾</ImagePlaceholder>
              <CardTitle>Encrypted Backups</CardTitle>
              <CardDescription>
                Automatic backups are encrypted and stored in multiple geographically 
                distributed data centers for maximum protection.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Advanced access controls and monitoring</SectionTitle>
          <SectionDescription>
            Control who can access your files with granular permissions. Monitor all 
            activity and receive alerts for suspicious behavior.
          </SectionDescription>

          <ImagePlaceholder style={{ height: '300px', margin: '0 auto 60px' }}>
            📊 Security Dashboard
          </ImagePlaceholder>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security with 2FA. Support for SMS, authenticator 
                apps, and hardware security keys.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Activity Logging</CardTitle>
              <CardDescription>
                Complete audit trail of all file access and modifications. Track who 
                accessed what, when, and from where.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>IP Whitelisting</CardTitle>
              <CardDescription>
                Restrict access to specific IP addresses or ranges. Ensure files can 
                only be accessed from approved locations.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Protect against data loss and ransomware</SectionTitle>
          <SectionDescription>
            Multiple layers of protection ensure your files are safe from accidental 
            deletion, hardware failures, and malicious attacks.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>Ransomware Detection</CardTitle>
              <CardDescription>
                AI algorithms detect ransomware patterns and automatically quarantine 
                suspicious files before they can cause damage.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Version Recovery</CardTitle>
              <CardDescription>
                Recover from ransomware attacks by restoring to a clean version. 
                Unlimited version history for 90 days.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>File Recovery</CardTitle>
              <CardDescription>
                Accidentally deleted files? Recover them from trash within 30 days. 
                Admin can restore files even after permanent deletion.
              </CardDescription>
            </InfoCard>
          </CardsContainer>
        </ContentSection>

        <ContentSection>
          <SectionTitle>Enterprise compliance and certifications</SectionTitle>
          <SectionDescription>
            We maintain the highest security standards and regularly undergo third-party 
            audits to ensure your data meets regulatory requirements.
          </SectionDescription>

          <CardsContainer>
            <InfoCard>
              <CardTitle>SOC 2 Type II</CardTitle>
              <CardDescription>
                Independently verified security, availability, and confidentiality 
                controls audited annually by third parties.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>GDPR Compliance</CardTitle>
              <CardDescription>
                Full compliance with European data protection regulations. Data residency 
                options and right-to-be-forgotten support.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>HIPAA Compliance</CardTitle>
              <CardDescription>
                Business Associate Agreements available for healthcare organizations. 
                PHI data handling meets all HIPAA requirements.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>ISO 27001</CardTitle>
              <CardDescription>
                Information security management system certified to international 
                standards for protecting sensitive data.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Data Residency</CardTitle>
              <CardDescription>
                Choose where your data is stored with regional data centers. Meet 
                local data sovereignty requirements.
              </CardDescription>
            </InfoCard>

            <InfoCard>
              <CardTitle>Regular Penetration Testing</CardTitle>
              <CardDescription>
                Quarterly security assessments by independent experts. Vulnerabilities 
                are identified and patched immediately.
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

export default SecureStorage;