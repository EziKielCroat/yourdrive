import React from "react";
import { motion } from "framer-motion";
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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const SecureStorage: React.FC = () => {
  return (
    <>
      <Navbar_main />

      <PageContainer>
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <HeroSection>
            <HeroContent>
              <HeroTitle>
                Privacy-first file storage<br />
                that you actually control.
              </HeroTitle>
              <HeroSubtitle>
                Simple, fast, and truly private. Self-host your files with end-to-end encryption, 
                or let us handle the infrastructure. Either way, your data stays yours.
              </HeroSubtitle>
              <LandingButton variant="primary" size="lg" purp="register">Start storing securely</LandingButton>
            </HeroContent>
          </HeroSection>
        </motion.div>

        {/* Top Features */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <FeaturesGrid>
            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <FeatureCard>
                <FeatureIcon>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </FeatureIcon>
                <FeatureTitle>Self-Hosting Freedom</FeatureTitle>
                <FeatureDescription>
                  Run it on your own hardware. Complete control over your data with simple installation and minimal resource requirements.
                </FeatureDescription>
              </FeatureCard>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <FeatureCard>
                <FeatureIcon>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 11H7C4.79086 11 3 12.7909 3 15V19C3 21.2091 4.79086 23 7 23H17C19.2091 23 21 21.2091 21 19V15C21 12.7909 19.2091 11 17 11Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                </FeatureIcon>
                <FeatureTitle>End-to-End Encryption</FeatureTitle>
                <FeatureDescription>
                  Optional client-side encryption means not even the server can see your files. You control the keys.
                </FeatureDescription>
              </FeatureCard>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
              <FeatureCard>
                <FeatureIcon>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </FeatureIcon>
                <FeatureTitle>Lightning Fast</FeatureTitle>
                <FeatureDescription>
                  Chunked uploads resume automatically. Modern architecture built on React and Node.js for speed that scales.
                </FeatureDescription>
              </FeatureCard>
            </motion.div>
          </FeaturesGrid>
        </motion.div>

        {/* Privacy Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Built for privacy from the ground up</SectionTitle>
            <SectionDescription>
              Unlike bloated alternatives, we focus on what matters: simple file management with 
              uncompromising privacy. No data mining, no AI training on your content.
            </SectionDescription>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Effortless File Management</CardTitle>
                    <CardDescription>
                      Drag-and-drop uploads with visual progress tracking. Organize with nested folders, 
                      bulk operations, and instant search. Everything just works.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.28 13.61C15.15 14.74 13.53 15.09 12.1 14.64L9.51001 17.22C9.33001 17.41 8.96001 17.53 8.69001 17.49L7.49001 17.33C7.09001 17.28 6.73001 16.9 6.67001 16.51L6.51001 15.31C6.47001 15.05 6.60001 14.68 6.78001 14.49L9.36001 11.91C8.92001 10.48 9.26001 8.86001 10.39 7.73001C12.01 6.11001 14.65 6.11001 16.28 7.73001C17.9 9.34001 17.9 11.98 16.28 13.61Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.45 16.28L9.59998 15.42" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.3945 10.7H13.4035" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Zero-Knowledge Architecture</CardTitle>
                    <CardDescription>
                      When encryption is enabled, your keys never leave your device. Server-side 
                      encryption at rest is standard for all files. You own your data completely.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12.8799V11.1199C2 10.0799 2.85 9.21994 3.9 9.21994C5.71 9.21994 6.45 7.93994 5.54 6.36994C5.02 5.46994 5.33 4.29994 6.24 3.77994L7.97 2.78994C8.76 2.31994 9.78 2.59994 10.25 3.38994L10.36 3.57994C11.26 5.14994 12.74 5.14994 13.65 3.57994L13.76 3.38994C14.23 2.59994 15.25 2.31994 16.04 2.78994L17.77 3.77994C18.68 4.29994 18.99 5.46994 18.47 6.36994C17.56 7.93994 18.3 9.21994 20.11 9.21994C21.15 9.21994 22.01 10.0699 22.01 11.1199V12.8799C22.01 13.9199 21.16 14.7799 20.11 14.7799C18.3 14.7799 17.56 16.0599 18.47 17.6299C18.99 18.5399 18.68 19.6999 17.77 20.2199L16.04 21.2099C15.25 21.6799 14.23 21.3999 13.76 20.6099L13.65 20.4199C12.75 18.8499 11.27 18.8499 10.36 20.4199L10.25 20.6099C9.78 21.3999 8.76 21.6799 7.97 21.2099L6.24 20.2199C5.33 19.6999 5.02 18.5299 5.54 17.6299C6.45 16.0599 5.71 14.7799 3.9 14.7799C2.85 14.7799 2 13.9199 2 12.8799Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Secure by Default</CardTitle>
                    <CardDescription>
                      All transmission uses modern encryption protocols. Two-factor authentication, 
                      audit logs, and IP whitelisting keep unauthorized users out.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>

        {/* Sharing Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Share files your way</SectionTitle>
            <SectionDescription>
              Generate secure share links in seconds. Set expiration dates, password protection, 
              and download limits. Revoke access anytime.
            </SectionDescription>

            <ImagePlaceholder style={{ height: '300px', margin: '0 auto 60px' }}>
              [Image: Share link generation interface showing options for password, expiration, and download limits with a clean toggle UI]
            </ImagePlaceholder>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.5 19H8C4 19 2 18 2 13V8C2 4 4 2 8 2H16C20 2 22 4 22 8V13C22 17 20 19 16 19H15.5C15.19 19 14.89 19.15 14.7 19.4L13.2 21.4C12.54 22.28 11.46 22.28 10.8 21.4L9.3 19.4C9.14 19.18 8.77 19 8.5 19Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.9965 11H16.0054" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.9955 11H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.99451 11H8.00349" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Flexible Sharing Options</CardTitle>
                    <CardDescription>
                      Create instant share links with optional password protection. Set custom expiration 
                      times from 1 hour to unlimited, and control download counts.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 17H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Public Folders</CardTitle>
                    <CardDescription>
                      Share entire folders at once with colleagues or clients. Track who viewed or 
                      downloaded content with detailed activity logs.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1199 12.78C12.0499 12.77 11.9599 12.77 11.8799 12.78C10.1199 12.72 8.71994 11.28 8.71994 9.50998C8.71994 7.69998 10.1799 6.22998 11.9999 6.22998C13.8099 6.22998 15.2799 7.69998 15.2799 9.50998C15.2699 11.28 13.8799 12.72 12.1199 12.78Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.7398 19.3801C16.9598 21.0101 14.5998 22.0001 11.9998 22.0001C9.39977 22.0001 7.03977 21.0101 5.25977 19.3801C5.35977 18.4401 5.95977 17.5201 7.02977 16.8001C9.76977 14.9801 14.2498 14.9801 16.9698 16.8001C18.0398 17.5201 18.6398 18.4401 18.7398 19.3801Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Complete Control</CardTitle>
                    <CardDescription>
                      Revoke access to shared links instantly. Monitor all sharing activity from a 
                      centralized dashboard. Your content, your rules.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>

        {/* Editing Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Edit and preview without leaving the browser</SectionTitle>
            <SectionDescription>
              Built-in editors for text, code, and documents. Preview images, PDFs, and more. 
              Version control keeps track of every change.
            </SectionDescription>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H11C11.55 2 12 2.45 12 3C12 3.55 11.55 4 11 4H9C5 4 4 5 4 9V15C4 19 5 20 9 20H15C19 20 20 19 20 15V13C20 12.45 20.45 12 21 12C21.55 12 22 12.45 22 13V15C22 20 20 22 15 22Z" fill="currentColor"/>
                        <path d="M8.49994 17.1399C8.20994 17.1399 7.91994 17.0599 7.67994 16.8999C7.26994 16.6399 7.03994 16.1699 7.07994 15.6799L7.25994 13.3199C7.28994 12.9399 7.50994 12.4799 7.78994 12.2099L15.3999 4.59994C16.9799 3.01994 18.6999 3.06994 20.2299 4.59994C21.1499 5.51994 21.5999 6.45994 21.5499 7.41994C21.4999 8.28994 21.0099 9.14994 20.2299 9.92994L12.6199 17.5399C12.3499 17.8099 11.8999 18.0399 11.5099 18.0699L9.14994 18.2499C8.91994 18.2399 8.69994 18.1899 8.49994 17.1399Z" fill="currentColor"/>
                        <path d="M19.2099 11.0601C18.9999 11.0601 18.7999 11.0001 18.6199 10.8801C17.8599 10.4201 17.1799 9.8101 16.6199 9.0801C16.0699 8.3701 15.6499 7.5901 15.3599 6.7701C15.2199 6.3801 15.4399 5.9601 15.8299 5.8201C16.2199 5.6801 16.6399 5.9001 16.7799 6.2901C17.0199 6.9801 17.3799 7.6401 17.8499 8.2301C18.3099 8.8001 18.8699 9.2901 19.5099 9.6801C19.8799 9.9101 20.0099 10.3701 19.7799 10.7301C19.6199 10.9701 19.4199 11.0601 19.2099 11.0601Z" fill="currentColor"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Integrated Text Editor</CardTitle>
                    <CardDescription>
                      Edit text files, markdown, and code directly in your browser. Syntax highlighting 
                      for common languages with live preview rendering.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.25 9.14993C18.94 5.51993 15.56 3.42993 12 3.42993C10.22 3.42993 8.49 3.94993 6.91 4.91993C5.33 5.89993 3.91 7.32993 2.75 9.14993C1.75 10.7199 1.75 13.2699 2.75 14.8399C5.06 18.4799 8.44 20.5599 12 20.5599C13.78 20.5599 15.51 20.0399 17.09 19.0699C18.67 18.0899 20.09 16.6599 21.25 14.8399C22.25 13.2799 22.25 10.7199 21.25 9.14993ZM12 16.0399C9.76 16.0399 7.96 14.2299 7.96 11.9999C7.96 9.76993 9.76 7.95993 12 7.95993C14.24 7.95993 16.04 9.76993 16.04 11.9999C16.04 14.2299 14.24 16.0399 12 16.0399Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16.04C9.76001 16.04 7.96001 14.23 7.96001 12C7.96001 9.77 9.76001 7.96 12 7.96C14.24 7.96 16.04 9.77 16.04 12C16.04 14.23 14.24 16.04 12 16.04Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Rich File Preview</CardTitle>
                    <CardDescription>
                      View images, PDFs, and documents without downloading. Add annotations, crop images, 
                      or rotate photos right in the preview pane.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.5 9.08984H20.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.6947 13.7002H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.6947 16.7002H15.7037" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.9955 13.7002H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.9955 16.7002H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.29431 13.7002H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.29431 16.7002H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Version History</CardTitle>
                    <CardDescription>
                      Auto-save protects your work. Compare versions side-by-side to see what changed. 
                      Unlimited version history for 90 days.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>

        {/* Self-hosting Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Self-host on your terms or let us handle it</SectionTitle>
            <SectionDescription>
              Deploy to your own server with simple installation, or use our managed hosting. 
              Either way, you get the same privacy-first experience.
            </SectionDescription>

            <ImagePlaceholder style={{ height: '300px', margin: '0 auto 60px' }}>
              [Image: Side-by-side comparison showing self-hosted setup (terminal/server icons) vs managed hosting (cloud icons) with equal feature sets]
            </ImagePlaceholder>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.91 11.12C20.91 16.01 17.36 20.59 12.51 21.93C12.18 22.02 11.82 22.02 11.49 21.93C6.63996 20.59 3.08996 16.01 3.08996 11.12V6.72997C3.08996 5.90997 3.70996 4.97997 4.47996 4.66997L10.05 2.39997C11.3 1.88997 12.71 1.88997 13.96 2.39997L19.53 4.66997C20.29 4.97997 20.92 5.90997 20.92 6.72997L20.91 11.12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12.5C13.1046 12.5 14 11.6046 14 10.5C14 9.39543 13.1046 8.5 12 8.5C10.8954 8.5 10 9.39543 10 10.5C10 11.6046 10.8954 12.5 12 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 12.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Simple Self-Hosting</CardTitle>
                    <CardDescription>
                      One-command installation that runs on modest hardware. SQLite for simplicity, 
                      PostgreSQL for scale. S3-compatible storage support included.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.44 2H17.55C21.11 2 22 2.89 22 6.44V12.77C22 16.33 21.11 17.21 17.56 17.21H6.44C2.89 17.22 2 16.33 2 12.78V6.44C2 2.89 2.89 2 6.44 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 17.2197V21.9997" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 13H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.5 22H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Managed Hosting Option</CardTitle>
                    <CardDescription>
                      Don't want to manage servers? We'll handle the infrastructure while you keep 
                      full control over your data. Pay less than big tech alternatives.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14.5 4.5V6.5C14.5 7.6 15.4 8.5 16.5 8.5H18.5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 13H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 17H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Built-in Backups</CardTitle>
                    <CardDescription>
                      Automatic backup system with configurable retention policies. Health check 
                      endpoints for monitoring. Environment-based configuration.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>

        {/* Collaboration Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Collaborate without compromise</SectionTitle>
            <SectionDescription>
              Invite team members with granular permissions. Comment on files, track activity, 
              and stay in sync across all devices.
            </SectionDescription>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 7.16C17.94 7.15 17.87 7.15 17.81 7.16C16.43 7.11 15.33 5.98 15.33 4.58C15.33 3.15 16.48 2 17.91 2C19.34 2 20.49 3.16 20.49 4.58C20.48 5.98 19.38 7.11 18 7.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.97 14.44C18.34 14.67 19.85 14.43 20.91 13.72C22.32 12.78 22.32 11.24 20.91 10.3C19.84 9.59004 18.31 9.35003 16.94 9.59003" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.96998 7.16C6.02998 7.15 6.09998 7.15 6.15998 7.16C7.53998 7.11 8.63998 5.98 8.63998 4.58C8.63998 3.15 7.48998 2 6.05998 2C4.62998 2 3.47998 3.16 3.47998 4.58C3.48998 5.98 4.58998 7.11 5.96998 7.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 14.44C5.63 14.67 4.12 14.43 3.06 13.72C1.65 12.78 1.65 11.24 3.06 10.3C4.13 9.59004 5.66 9.35003 7.03 9.59003" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 14.63C11.94 14.62 11.87 14.62 11.81 14.63C10.43 14.58 9.32996 13.45 9.32996 12.05C9.32996 10.62 10.48 9.47003 11.91 9.47003C13.34 9.47003 14.49 10.63 14.49 12.05C14.48 13.45 13.38 14.59 12 14.63Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.08997 17.78C7.67997 18.72 7.67997 20.26 9.08997 21.2C10.69 22.27 13.31 22.27 14.91 21.2C16.32 20.26 16.32 18.72 14.91 17.78C13.32 16.72 10.69 16.72 9.08997 17.78Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Team Workspaces</CardTitle>
                    <CardDescription>
                      Create shared folders with team access. Assign roles from viewer to owner, 
                      controlling who can view, edit, or manage files.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.02 2.90991C8.69 2.90991 6 5.59991 6 8.92991V11.7999C6 12.4099 5.76 13.3399 5.45 13.8599L4.3 15.7699C3.59 16.9499 4.08 18.2599 5.38 18.6999C9.69 20.1399 14.34 20.1399 18.65 18.6999C19.86 18.2899 20.39 16.8699 19.73 15.7699L18.58 13.8599C18.28 13.3399 18.04 12.4099 18.04 11.7999V8.92991C18.04 5.60991 15.34 2.90991 12.02 2.90991Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round"/>
                        <path d="M13.87 3.19994C13.56 3.10994 13.24 3.03994 12.91 2.99994C11.95 2.87994 11.03 2.94994 10.17 3.19994C10.46 2.45994 11.18 1.93994 12.02 1.93994C12.86 1.93994 13.58 2.45994 13.87 3.19994Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.02 19.0601C15.02 20.7101 13.67 22.0601 12.02 22.0601C11.2 22.0601 10.44 21.7201 9.90002 21.1801C9.36002 20.6401 9.02002 19.8801 9.02002 19.0601" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Activity Tracking</CardTitle>
                    <CardDescription>
                      See recent changes in a unified activity feed. Get notified with @mentions 
                      and real-time presence indicators show who's online.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6V2H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 7L22 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Multi-Device Sync</CardTitle>
                    <CardDescription>
                      Access files from any device with a browser. Progressive web app support for 
                      mobile. Selective sync lets you choose what to store locally.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>

        {/* Smart Features Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Smart features that save time</SectionTitle>
            <SectionDescription>
              Duplicate detection prevents wasted space. Automatic thumbnails make browsing faster. 
              Intelligent search finds files instantly.
            </SectionDescription>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 22L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Smart Search</CardTitle>
                    <CardDescription>
                      Filter by date, type, size, and owner. Recent files quick access and starred 
                      favorites keep important content at your fingertips.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 4.99982C3 4.99982 3 6.99982 3 8.99982V14.9998C3 16.9998 3 18.9998 7 18.9998" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M17 4.99982C21 4.99982 21 6.99982 21 8.99982V14.9998C21 16.9998 21 18.9998 17 18.9998" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M14 2H10C9 2 9 2.45 9 3V21C9 21.55 9 22 10 22H14C15 22 15 21.55 15 21V3C15 2.45 15 2 14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Duplicate Detection</CardTitle>
                    <CardDescription>
                      Automatically identify duplicate files to save storage space. Smart algorithms 
                      detect copies even if renamed or in different folders.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.66 10.44L20.68 14.62C19.84 18.23 18.18 19.69 15.06 19.39C14.56 19.35 14.02 19.26 13.44 19.12L11.76 18.72C7.59 17.73 6.3 15.67 7.28 11.49L8.26 7.30001C8.46 6.45001 8.7 5.71001 9 5.10001C10.17 2.68001 12.16 2.03001 15.5 2.82001L17.17 3.21001C21.36 4.19001 22.64 6.26001 21.66 10.44Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.06 19.3898C14.44 19.8098 13.66 20.1598 12.71 20.4698L11.13 20.9898C7.15998 22.2698 5.06997 21.1998 3.77997 17.2298L2.49997 13.2798C1.21997 9.30977 2.27997 7.20977 6.24997 5.92977L7.82997 5.40977C8.23997 5.27977 8.62997 5.16977 8.99997 5.09977C8.69997 5.70977 8.45997 6.44977 8.25997 7.29977L7.27997 11.4898C6.29997 15.6698 7.58998 17.7298 11.76 18.7198L13.44 19.1198C14.02 19.2598 14.56 19.3498 15.06 19.3898Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>File Recovery</CardTitle>
                    <CardDescription>
                      Accidentally deleted files go to trash for 30 days. Admins can restore files 
                      even after permanent deletion. Never lose important data.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>

        {/* Developer Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          transition={{ duration: 0.6 }}
        >
          <ContentSection>
            <SectionTitle>Developer-friendly from day one</SectionTitle>
            <SectionDescription>
              Clean REST API, headless operation, and extensive documentation. Build custom 
              integrations or use our web interface.
            </SectionDescription>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <CardsContainer>
                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.5 16L10.5 13L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.5 16H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Full REST API</CardTitle>
                    <CardDescription>
                      Complete programmatic access to all features. Run the platform headless and 
                      build your own frontend. Comprehensive API documentation included.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.44 8.8999C20.04 9.2099 21.51 11.0599 21.51 15.1099V15.2399C21.51 19.7099 19.72 21.4999 15.25 21.4999H8.73998C4.26998 21.4999 2.47998 19.7099 2.47998 15.2399V15.1099C2.47998 11.0899 3.92998 9.2399 7.46998 8.9099" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 15V3.62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.35 5.85L12 2.5L8.65002 5.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>Modern Tech Stack</CardTitle>
                    <CardDescription>
                      Built with React and Node.js for performance and maintainability. Clean codebase 
                      that's easy to understand, modify, and extend.
                    </CardDescription>
                  </InfoCard>
                </motion.div>

                <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <InfoCard>
                    <FeatureIcon>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 9.14999V7.03999C2 5.17999 3.49 3.69 5.35 3.69H7.47C9.32 3.69 10.82 5.17999 10.82 7.03999V9.14999C10.82 11.01 9.33 12.5 7.47 12.5H5.35C3.49 12.5 2 11.01 2 9.14999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.18 16.97V14.86C13.18 13 14.67 11.51 16.53 11.51H18.65C20.5 11.51 22 13 22 14.86V16.97C22 18.83 20.51 20.32 18.65 20.32H16.53C14.67 20.31 13.18 18.82 13.18 16.97Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.77 6.33H17.26C15.86 6.33 15.02 5.02 15.72 3.81L17.47 0.79C18.07 -0.26 19.69 -0.26 20.3 0.79L22.05 3.81C22.75 5.02 21.91 6.33 20.77 6.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.73998 23.2101C8.50998 23.2101 9.94998 21.7701 9.94998 20.0001C9.94998 18.2301 8.50998 16.7901 6.73998 16.7901C4.96998 16.7901 3.52998 18.2301 3.52998 20.0001C3.52998 21.7701 4.96998 23.2101 6.73998 23.2101Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </FeatureIcon>
                    <CardTitle>S3-Compatible Storage</CardTitle>
                    <CardDescription>
                      Use local disk, MinIO, Backblaze, or any S3-compatible service. Flexible storage 
                      backend options adapt to your infrastructure.
                    </CardDescription>
                  </InfoCard>
                </motion.div>
              </CardsContainer>
            </motion.div>
          </ContentSection>
        </motion.div>
      </PageContainer>

      <HeroContGrad style={{ transform: "rotate(180deg)" }} />
      <Footer />
    </>
  );
};

export default SecureStorage;