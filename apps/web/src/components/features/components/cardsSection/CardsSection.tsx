import React from 'react';
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
        <TopSection>
          <CreativeCard>
            <CreativeIcon>🌐</CreativeIcon>
            <CreativeTextArea>
              <CreativeTitle>
                Loved by the<br />
                best creative<br />
                teams all over<br />
                the world
              </CreativeTitle>
            </CreativeTextArea>
            <CreativeIllustration>
              <div style={{ fontSize: '80px' }}>🎨</div>
            </CreativeIllustration>
          </CreativeCard>
        </TopSection>

        <UpdatesGrid>
          <UpdateCard background="linear-gradient(45deg, #5EB6FE 0%, #91CEFF 100%)">
            <UpdateBadge>Release notes</UpdateBadge>
            <UpdateTitle>
              Powerful updates<br />
              every week
            </UpdateTitle>
            <UpdateLink href="#">See what's new →</UpdateLink>
          </UpdateCard>

          <UpdateCard background="linear-gradient(45deg, #91CEFF 0%, #5EB6FE 100%)">
            <UpdateBadge>PRICING</UpdateBadge>
            <UpdateTitle>
              Start for free.<br />
              Upgrade anytime.
            </UpdateTitle>
            <UpdateLink href="#">See our plans →</UpdateLink>
          </UpdateCard>
        </UpdatesGrid>

        <PartnersGrid>
          <PartnerItem>
            <PartnerIconWrapper>📱</PartnerIconWrapper>
            <PartnerTitle>Official Figma Partner</PartnerTitle>
          </PartnerItem>
          <PartnerItem>
            <PartnerIconWrapper>🎨</PartnerIconWrapper>
            <PartnerTitle>Design Tool of the Year</PartnerTitle>
          </PartnerItem>
          <PartnerItem>
            <PartnerIconWrapper>⚡</PartnerIconWrapper>
            <PartnerTitle>Top Animation Tool</PartnerTitle>
          </PartnerItem>
        </PartnersGrid>
      </CardsContainer>
    </CardsSection>
  );
};

export default CardsSectionComponent;