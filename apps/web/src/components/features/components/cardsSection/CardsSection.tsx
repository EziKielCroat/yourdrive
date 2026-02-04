import React from 'react';
import { motion } from 'framer-motion';
import {
  CardsSection,
  CardsContainer,
  TopSection,
  CreativeCard,
  CreativeIcon,
  CreativeTextArea,
  CreativeTitle,
  CreativeIllustration,
  UpdatesGrid,
  UpdateCard,
  UpdateBadge,
  UpdateTitle,
  UpdateLink,
  PartnersGrid,
  PartnerItem,
  PartnerIconWrapper,
  PartnerTitle
} from './styles/cardsSection';

const CardsSectionComponent: React.FC = () => {
  return (
    <CardsSection>
      <CardsContainer>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <TopSection>
            <CreativeCard>
              <CreativeIcon>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </CreativeIcon>
              <CreativeTextArea>
                <CreativeTitle>
                  Privacy isn't<br />
                  a feature—<br />
                  it's the<br />
                  foundation
                </CreativeTitle>
              </CreativeTextArea>
              <CreativeIllustration>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2E3038" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </CreativeIllustration>
            </CreativeCard>
          </TopSection>
        </motion.div>

        <UpdatesGrid>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <UpdateCard background="linear-gradient(45deg, #5EB6FE 0%, #91CEFF 100%)">
              <UpdateBadge>YOUR DATA</UpdateBadge>
              <UpdateTitle>
                Complete control.<br />
                Zero compromises.
              </UpdateTitle>
              <UpdateLink href="#">Learn about self-hosting →</UpdateLink>
            </UpdateCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <UpdateCard background="linear-gradient(45deg, #91CEFF 0%, #5EB6FE 100%)">
              <UpdateBadge>PRICING</UpdateBadge>
              <UpdateTitle>
                Free self-hosting.<br />
                Managed plans available.
              </UpdateTitle>
              <UpdateLink href="#">See pricing options →</UpdateLink>
            </UpdateCard>
          </motion.div>
        </UpdatesGrid>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <PartnersGrid>
            <PartnerItem>
              <PartnerIconWrapper>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1F9AFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </PartnerIconWrapper>
              <PartnerTitle>Built for Performance</PartnerTitle>
            </PartnerItem>
            <PartnerItem>
              <PartnerIconWrapper>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1F9AFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18L22 12 16 6" />
                  <path d="M8 6L2 12 8 18" />
                </svg>
              </PartnerIconWrapper>
              <PartnerTitle>Open Source Core</PartnerTitle>
            </PartnerItem>
            <PartnerItem>
              <PartnerIconWrapper>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1F9AFE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </PartnerIconWrapper>
              <PartnerTitle>Runs on Modest Hardware</PartnerTitle>
            </PartnerItem>
          </PartnersGrid>
        </motion.div>
      </CardsContainer>
    </CardsSection>
  );
};

export default CardsSectionComponent;