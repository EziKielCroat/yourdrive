import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";
import LandingButton from "../shared/landingbutton/LandingButton";
import styled from "styled-components";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar_main />
      <HeroContGradTop />
      
      <Container>
        <Content
          as={motion.div}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ErrorCode
            as={motion.div}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            404
          </ErrorCode>
          
          <Title
            as={motion.h1}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Page Not Found
          </Title>
          
          <Description
            as={motion.p}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            The page you're looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track.
          </Description>

          <ButtonGroup
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <LandingButton 
              variant="primary" 
              size="lg" 
              purp="home"
              onClick={() => navigate({ to: "/" })}
            >
              Go Home
            </LandingButton>
            <BackButton onClick={() => window.history.back()}>
              Go Back
            </BackButton>
          </ButtonGroup>
        </Content>
      </Container>

      <HeroContGrad style={{ transform: "rotate(180deg)" }} />
      <Footer />
    </>
  );
};

const Container = styled.div`
  width: 100%;
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
  background: #ffffff;

  @media (max-width: 968px) {
    padding: 100px 20px 60px;
  }

  @media (max-width: 640px) {
    padding: 80px 15px 40px;
  }
`;

const Content = styled.div`
  max-width: 600px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const ErrorCode = styled.div`
  font-family: "Forma DJR Display", sans-serif;
  font-size: 120px;
  font-weight: 600;
  color: #1F9AFE;
  line-height: 1;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 96px;
  }

  @media (max-width: 640px) {
    font-size: 72px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 600;
  color: #2E3038;
  margin: 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
    
    button {
      width: 100%;
    }
  }
`;

const BackButton = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 500;
  color: #2E3038;
  background: transparent;
  border: 2px solid #d0d7e7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;

  &:hover {
    border-color: #1F9AFE;
    color: #1F9AFE;
    background: rgba(31, 154, 254, 0.05);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export default NotFound;
