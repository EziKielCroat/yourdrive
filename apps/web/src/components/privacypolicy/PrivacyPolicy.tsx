import React from 'react';
import {
  PageContainer,
  ContentWrapper,
  HeroSection,
  PageTitle,
  EffectiveDate,
  IntroSection,
  Paragraph,
  MainSection,
  SectionTitle,
  SubsectionTitle,
  BulletList,
  BulletItem,
  HighlightBox
} from './styles/privacyPolicy';

import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <Navbar_main />
      <HeroContGradTop />

      <PageContainer>
        <HeroSection>
          <PageTitle>Privacy Policy</PageTitle>
          <EffectiveDate>Effective Date: January 20, 2026</EffectiveDate>
        </HeroSection>

        <ContentWrapper>
          {/* INTRODUCTION */}
          <IntroSection>
            <SectionTitle>INTRODUCTION AND SCOPE</SectionTitle>
            <Paragraph>
              This Privacy Policy describes how we, the operator of this cloud-based file storage and sharing service,
              collect, use, store, share, and protect your personal information when you access or use our service.
              This Privacy Policy applies to all users of the service, regardless of how you access or use it,
              including through our website, mobile applications, desktop applications, and application programming interfaces.
            </Paragraph>
            <Paragraph>
              By accessing or using the service, you acknowledge that you have read, understood, and agree to be bound
              by the terms of this Privacy Policy. If you do not agree with this Privacy Policy, you must not access or
              use the service. This Privacy Policy should be read in conjunction with our Terms of Service and any other
              policies governing your use of the service.
            </Paragraph>
            <Paragraph>
              We are committed to protecting your privacy and handling your personal information with care,
              transparency, and in compliance with applicable data protection laws and regulations.
            </Paragraph>
          </IntroSection>

          {/* INFORMATION WE COLLECT */}
          <MainSection>
            <SectionTitle>INFORMATION WE COLLECT</SectionTitle>
            <Paragraph>
              We collect various types of information in connection with the service, including information you provide
              directly to us, information we collect automatically when you use the service, and information we receive
              from third parties.
            </Paragraph>

            <SubsectionTitle>Information You Provide Directly to Us</SubsectionTitle>
            <Paragraph>
              When you register for an account, we collect information necessary to create and maintain your account,
              including your full name, email address, and password. Depending on how you use the service, we may also
              collect profile information, billing details, company information, and communications you send to us.
            </Paragraph>
            <Paragraph>
              When you upload or share files, we collect file content, file names, metadata, folder structures,
              sharing permissions, comments, tags, and any data contained within the files you choose to upload.
            </Paragraph>

            <SubsectionTitle>Information We Collect Automatically</SubsectionTitle>
            <Paragraph>
              When you access the service, we automatically collect technical and usage information such as IP address,
              device type, operating system, browser type, session duration, pages viewed, actions taken, timestamps,
              error logs, and performance metrics.
            </Paragraph>
            <Paragraph>
              We use cookies, SDKs, log files, analytics tools, and similar technologies to collect this information
              to improve performance, usability, and security.
            </Paragraph>

            <SubsectionTitle>Information We Receive from Third Parties</SubsectionTitle>
            <Paragraph>
              If you connect third-party services or are invited by another user, we may receive information such as
              your name, email address, and authorized data from those services, in accordance with their terms and
              your settings.
            </Paragraph>
          </MainSection>

          {/* HOW WE USE INFORMATION */}
          <MainSection>
            <SectionTitle>HOW WE USE YOUR INFORMATION</SectionTitle>

            <SubsectionTitle>Providing and Maintaining the Service</SubsectionTitle>
            <BulletList>
              <BulletItem>Creating and managing your account</BulletItem>
              <BulletItem>Storing, syncing, and sharing files</BulletItem>
              <BulletItem>Processing payments and managing subscriptions</BulletItem>
              <BulletItem>Providing customer support</BulletItem>
            </BulletList>

            <SubsectionTitle>Improving and Developing the Service</SubsectionTitle>
            <BulletList>
              <BulletItem>Analyzing usage patterns and trends</BulletItem>
              <BulletItem>Fixing bugs and optimizing performance</BulletItem>
              <BulletItem>Developing new features and functionality</BulletItem>
            </BulletList>

            <SubsectionTitle>Communicating with You</SubsectionTitle>
            <Paragraph>
              We use your contact information to send service-related messages, security alerts, updates, and,
              with your consent, marketing communications.
            </Paragraph>

            <SubsectionTitle>Security, Fraud Prevention, and Compliance</SubsectionTitle>
            <Paragraph>
              We process information to protect accounts, detect fraud, prevent abuse, enforce policies,
              and comply with legal obligations.
            </Paragraph>
          </MainSection>

          {/* SHARING */}
          <MainSection>
            <SectionTitle>HOW WE SHARE YOUR INFORMATION</SectionTitle>
            <Paragraph>
              We do not sell your personal information. We share information only in limited circumstances.
            </Paragraph>

            <SubsectionTitle>Sharing Based on Your Instructions</SubsectionTitle>
            <Paragraph>
              When you share files or folders, information is shared according to the permissions you choose.
            </Paragraph>

            <SubsectionTitle>Service Providers</SubsectionTitle>
            <Paragraph>
              We work with trusted third-party service providers who assist with hosting, payments, analytics,
              security, communications, and support, under strict contractual obligations.
            </Paragraph>

            <SubsectionTitle>Legal Requirements and Business Transfers</SubsectionTitle>
            <Paragraph>
              We may disclose information to comply with legal obligations or in connection with mergers,
              acquisitions, or asset sales.
            </Paragraph>
          </MainSection>

          {/* SECURITY */}
          <MainSection>
            <SectionTitle>DATA SECURITY AND PROTECTION</SectionTitle>
            <Paragraph>
              We implement technical, administrative, and physical safeguards to protect your information,
              including encryption in transit and at rest, access controls, monitoring, and regular audits.
            </Paragraph>
            <Paragraph>
              While we take reasonable measures to protect your data, no system can guarantee absolute security.
              You are responsible for safeguarding your credentials and devices.
            </Paragraph>
          </MainSection>

          {/* RETENTION */}
          <MainSection>
            <SectionTitle>DATA RETENTION AND DELETION</SectionTitle>
            <Paragraph>
              We retain information as long as necessary to provide the service, comply with legal obligations,
              resolve disputes, and enforce agreements.
            </Paragraph>
            <Paragraph>
              Deleted files may remain in backups for a limited period before permanent removal.
            </Paragraph>
          </MainSection>

          {/* RIGHTS */}
          <MainSection>
            <SectionTitle>YOUR RIGHTS AND CHOICES</SectionTitle>
            <BulletList>
              <BulletItem>Access and review your information</BulletItem>
              <BulletItem>Correct inaccurate data</BulletItem>
              <BulletItem>Request deletion of personal information</BulletItem>
              <BulletItem>Export and transfer your data</BulletItem>
              <BulletItem>Withdraw consent and manage communications</BulletItem>
            </BulletList>
          </MainSection>

          {/* INTERNATIONAL */}
          <MainSection>
            <SectionTitle>INTERNATIONAL DATA TRANSFERS</SectionTitle>
            <Paragraph>
              Your information may be processed in countries other than your own. We use lawful transfer
              mechanisms and safeguards to protect your data internationally.
            </Paragraph>
          </MainSection>

          {/* CHILDREN */}
          <MainSection>
            <SectionTitle>CHILDREN'S PRIVACY</SectionTitle>
            <Paragraph>
              The service is not intended for children under thirteen. We do not knowingly collect personal
              information from children under thirteen.
            </Paragraph>
          </MainSection>

          {/* CHANGES */}
          <MainSection>
            <SectionTitle>CHANGES TO THIS PRIVACY POLICY</SectionTitle>
            <Paragraph>
              We may update this Privacy Policy from time to time. Continued use of the service after updates
              constitutes acceptance of the revised policy.
            </Paragraph>
          </MainSection>

          {/* CONTACT */}
          <HighlightBox>
            <strong>Contact Us:</strong> If you have any questions, concerns, or requests regarding this Privacy Policy
            or our privacy practices, please contact us through the service.
          </HighlightBox>
        </ContentWrapper>
      </PageContainer>

      <HeroContGrad style={{ transform: "rotate(180deg)" }} />
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
