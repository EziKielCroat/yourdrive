import React from "react";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
import styled from "styled-components";
import { motion } from "framer-motion";

const HelpCenter: React.FC = () => {
  const faqs = [
    {
      question: "How do I upload files?",
      answer: "You can upload files by clicking the upload button in the dashboard or by dragging and dropping files directly into the upload area. Files up to 50MB can be uploaded directly, while larger files use multipart upload.",
    },
    {
      question: "How do I share files?",
      answer: "Select a file and click the share button. You can generate a shareable link with customizable permissions (view, comment, edit, or download). You can also set expiration dates and password protection.",
    },
    {
      question: "What file types are supported?",
      answer: "NexaCore supports all file types including documents, images, videos, audio files, and archives. You can preview many file types directly in your browser.",
    },
    {
      question: "How secure is my data?",
      answer: "Your files are encrypted both at rest and in transit. We use industry-standard encryption protocols to ensure your data remains secure and private.",
    },
    {
      question: "Can I recover deleted files?",
      answer: "Yes, deleted files are moved to the Recycle Bin where they can be restored within 30 days. After that period, files are permanently deleted.",
    },
    {
      question: "How much storage do I get?",
      answer: "Storage limits depend on your plan. Check the Pricing page for details on available plans and storage limits.",
    },
  ];

  return (
    <>
      <Navbar_main />
      <HeroContGradTop />
      <Container>
        <Header
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Help Center</Title>
          <Subtitle>Find answers to common questions about NexaCore</Subtitle>
        </Header>

        <FaqSection>
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Question>{faq.question}</Question>
              <Answer>{faq.answer}</Answer>
            </FaqItem>
          ))}
        </FaqSection>

        <ContactSection
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ContactTitle>Still need help?</ContactTitle>
          <ContactText>
            If you can't find what you're looking for, check out our{" "}
            <Link href="/guide">Guide</Link> or{" "}
            <Link href="/api-docs">API Documentation</Link> for more detailed
            information.
          </ContactText>
        </ContactSection>
      </Container>
      <HeroContGrad />
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 100vw;
  min-height: calc(100vh - 200px);
  padding: 120px 20px 80px;
  background: #ffffff;

  @media (max-width: 968px) {
    padding: 100px 20px 60px;
  }
`;

const Header = styled.div`
  max-width: 800px;
  margin: 0 auto 60px;
  text-align: center;

  @media (max-width: 640px) {
    margin-bottom: 40px;
  }
`;

const Title = styled.h1`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 48px;
  line-height: 58px;
  letter-spacing: -1.6px;
  color: #2e3038;
  margin-bottom: 16px;

  @media (max-width: 968px) {
    font-size: 40px;
    line-height: 50px;
  }

  @media (max-width: 640px) {
    font-size: 32px;
    line-height: 42px;
  }
`;

const Subtitle = styled.p`
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 18px;
  line-height: 28px;
  color: #777a88;

  @media (max-width: 640px) {
    font-size: 16px;
    line-height: 24px;
  }
`;

const FaqSection = styled.div`
  max-width: 800px;
  margin: 0 auto 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 640px) {
    gap: 20px;
  }
`;

const FaqItem = styled.div`
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background: #e9ecef;
  }

  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const Question = styled.h3`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 26px;
  color: #2e3038;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    font-size: 16px;
    line-height: 24px;
  }
`;

const Answer = styled.p`
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #777a88;

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 22px;
  }
`;

const ContactSection = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: #dde2ee;
  border-radius: 16px;
  text-align: center;

  @media (max-width: 640px) {
    padding: 30px 20px;
  }
`;

const ContactTitle = styled.h2`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: #2e3038;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    font-size: 20px;
    line-height: 28px;
  }
`;

const ContactText = styled.p`
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  color: #777a88;

  @media (max-width: 640px) {
    font-size: 14px;
    line-height: 22px;
  }
`;

const Link = styled.a`
  color: #1f9afe;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: #0d7ed8;
    text-decoration: underline;
  }
`;

export default HelpCenter;
