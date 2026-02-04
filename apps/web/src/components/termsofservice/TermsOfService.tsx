import React from 'react';
import {
  PageContainer,
  ContentWrapper,
  HeroSection,
  PageTitle,
  EffectiveDate,
  WarningBox,
  ArticleSection,
  ArticleTitle,
  SubsectionTitle,
  Paragraph,
  DefinitionList,
  DefinitionTerm,
  DefinitionDescription,
  LastUpdated
} from './styles/termsOfService';

import { GlobalReset } from "../landing/styles/landing";
import Navbar_main from "../shared/navbar_main/Navbar_main";
import Footer from "../shared/footer/Footer";
import { HeroContGrad, HeroContGradTop } from "../landing/components/hero/styles/hero";

const TermsOfService: React.FC = () => {
  return (
    <>
    <Navbar_main/>
    <HeroContGradTop /> 
    <PageContainer>
      <HeroSection>
        <PageTitle>Terms of Service</PageTitle>
        <EffectiveDate>Effective Date: January 20, 2026</EffectiveDate>
      </HeroSection>

      <ContentWrapper>
        <WarningBox>
          PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THIS SERVICE.
          BY ACCESSING OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS
          AND ALL TERMS INCORPORATED BY REFERENCE. IF YOU DO NOT AGREE TO ALL OF
          THESE TERMS, DO NOT ACCESS OR USE THE SERVICE.
        </WarningBox>

        {/* ARTICLE I */}
        <ArticleSection>
          <ArticleTitle>ARTICLE I - DEFINITIONS AND INTERPRETATION</ArticleTitle>

          <SubsectionTitle>1.1 Definitions.</SubsectionTitle>
          <Paragraph>
            For purposes of these Terms of Service, the following terms shall have the
            meanings set forth below:
          </Paragraph>

          <DefinitionList>
            <div>
              <DefinitionTerm>"Account"</DefinitionTerm>
              <DefinitionDescription>
                means the user account created by You to access and use the Service,
                including all data, content, and information associated therewith.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"Acceptable Use Policy"</DefinitionTerm>
              <DefinitionDescription>
                means the policy set forth in Article IV hereof, which governs the
                permitted and prohibited uses of the Service.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"Confidential Information"</DefinitionTerm>
              <DefinitionDescription>
                means any information disclosed by one party to the other party,
                whether orally, in writing, or by inspection, including business
                plans, source code, financial information, and information marked
                as confidential.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"Content"</DefinitionTerm>
              <DefinitionDescription>
                means any information, data, text, software, music, sound,
                photographs, graphics, video, messages, or other materials made
                available through the Service.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"Intellectual Property Rights"</DefinitionTerm>
              <DefinitionDescription>
                means all intellectual property rights under applicable law,
                including patents, copyrights, trademarks, trade secrets, and
                related rights.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"Service"</DefinitionTerm>
              <DefinitionDescription>
                means the cloud-based file storage, management, sharing, and
                collaboration platform provided by Us.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"Terms"</DefinitionTerm>
              <DefinitionDescription>
                means these Terms of Service, as amended from time to time.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"User Content"</DefinitionTerm>
              <DefinitionDescription>
                means all Content that You upload or otherwise make available
                through the Service.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"We", "Us", or "Our"</DefinitionTerm>
              <DefinitionDescription>
                means the company providing the Service and its affiliates.
              </DefinitionDescription>
            </div>

            <div>
              <DefinitionTerm>"You" or "Your"</DefinitionTerm>
              <DefinitionDescription>
                means the individual or entity using the Service.
              </DefinitionDescription>
            </div>
          </DefinitionList>

          <SubsectionTitle>1.2 Interpretation.</SubsectionTitle>
          <Paragraph>
            Headings are for convenience only, words in the singular include the
            plural, references to laws include amendments, and the word “including”
            means “including without limitation.”
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE II */}
        <ArticleSection>
          <ArticleTitle>ARTICLE II - ACCEPTANCE OF TERMS AND ELIGIBILITY</ArticleTitle>

          <SubsectionTitle>2.1 Binding Agreement.</SubsectionTitle>
          <Paragraph>
            By accessing or using the Service, You acknowledge that You have read,
            understood, and agree to be bound by these Terms.
          </Paragraph>

          <SubsectionTitle>2.2 Additional Terms.</SubsectionTitle>
          <Paragraph>
            Certain features of the Service may be subject to additional terms,
            which are incorporated by reference.
          </Paragraph>

          <SubsectionTitle>2.3 Eligibility Requirements.</SubsectionTitle>
          <Paragraph>
            You represent that You meet all eligibility requirements, including
            age, legal capacity, and compliance with applicable laws.
          </Paragraph>

          <SubsectionTitle>2.4 Geographic Restrictions.</SubsectionTitle>
          <Paragraph>
            The Service may not be available in all locations, and You are
            responsible for compliance with local laws.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE III */}
        <ArticleSection>
          <ArticleTitle>ARTICLE III - ACCOUNT REGISTRATION AND SECURITY</ArticleTitle>

          <SubsectionTitle>3.1 Account Creation.</SubsectionTitle>
          <Paragraph>
            You must provide accurate and complete information when creating an
            Account.
          </Paragraph>

          <SubsectionTitle>3.2 Account Credentials.</SubsectionTitle>
          <Paragraph>
            You are responsible for maintaining the confidentiality of Your
            credentials and all activity under Your Account.
          </Paragraph>

          <SubsectionTitle>3.3 Account Termination by You.</SubsectionTitle>
          <Paragraph>
            You may terminate Your Account at any time, subject to applicable
            obligations.
          </Paragraph>

          <SubsectionTitle>3.4 Account Termination or Suspension by Us.</SubsectionTitle>
          <Paragraph>
            We may suspend or terminate Accounts for violations, legal reasons,
            or discontinuation of the Service.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE IV */}
        <ArticleSection>
          <ArticleTitle>ARTICLE IV - ACCEPTABLE USE POLICY</ArticleTitle>

          <SubsectionTitle>4.1 Permitted Uses.</SubsectionTitle>
          <Paragraph>
            We grant You a limited, revocable license to use the Service in
            accordance with these Terms.
          </Paragraph>

          <SubsectionTitle>4.2 Prohibited Uses.</SubsectionTitle>
          <Paragraph>
            You agree not to misuse the Service, including engaging in illegal,
            harmful, or unauthorized activities.
          </Paragraph>

          <SubsectionTitle>4.3 Prohibited Content.</SubsectionTitle>
          <Paragraph>
            You may not upload content that is unlawful, harmful, infringing,
            or otherwise objectionable.
          </Paragraph>

          <SubsectionTitle>4.4 Enforcement.</SubsectionTitle>
          <Paragraph>
            We reserve the right to monitor, remove content, and enforce these
            Terms at Our discretion.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE V */}
        <ArticleSection>
          <ArticleTitle>ARTICLE V - INTELLECTUAL PROPERTY RIGHTS</ArticleTitle>

          <SubsectionTitle>5.1 Ownership of Service.</SubsectionTitle>
          <Paragraph>
            The Service and all related intellectual property are owned by Us
            or Our licensors.
          </Paragraph>

          <SubsectionTitle>5.2 Trademarks.</SubsectionTitle>
          <Paragraph>
            All trademarks used in connection with the Service are protected
            by law.
          </Paragraph>

          <SubsectionTitle>5.3 Ownership of User Content.</SubsectionTitle>
          <Paragraph>
            You retain ownership of Your User Content but grant Us a broad
            license to use it to operate the Service.
          </Paragraph>

          <SubsectionTitle>5.4 Representations and Warranties.</SubsectionTitle>
          <Paragraph>
            You represent that You have all rights necessary to submit User
            Content.
          </Paragraph>

          <SubsectionTitle>5.5 Feedback.</SubsectionTitle>
          <Paragraph>
            Any feedback You provide may be used by Us without compensation.
          </Paragraph>

          <SubsectionTitle>5.6 Digital Millennium Copyright Act.</SubsectionTitle>
          <Paragraph>
            We respond to valid notices of copyright infringement and terminate
            repeat infringers.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE VI */}
        <ArticleSection>
          <ArticleTitle>ARTICLE VI - PRIVACY AND DATA PROTECTION</ArticleTitle>

          <SubsectionTitle>6.1 Privacy Policy.</SubsectionTitle>
          <Paragraph>
            Your use of the Service is subject to Our Privacy Policy.
          </Paragraph>

          <SubsectionTitle>6.2 Data Security.</SubsectionTitle>
          <Paragraph>
            We use reasonable safeguards but cannot guarantee absolute security.
          </Paragraph>

          <SubsectionTitle>6.3 Data Processing.</SubsectionTitle>
          <Paragraph>
            Your information may be processed and transferred internationally
            in accordance with applicable law.
          </Paragraph>

          <SubsectionTitle>6.4 Data Retention.</SubsectionTitle>
          <Paragraph>
            We retain data as necessary to provide the Service and meet legal
            obligations.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE VII */}
        <ArticleSection>
          <ArticleTitle>ARTICLE VII - DISCLAIMERS AND WARRANTIES</ArticleTitle>

          <Paragraph>
            The Service is provided “AS IS” without warranties of any kind, and
            liability is limited to the maximum extent permitted by law.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE VIII */}
        <ArticleSection>
          <ArticleTitle>ARTICLE VIII - INDEMNIFICATION</ArticleTitle>

          <Paragraph>
            You agree to indemnify and hold Us harmless from claims arising out
            of Your use of the Service or violation of these Terms.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE IX */}
        <ArticleSection>
          <ArticleTitle>ARTICLE IX - DISPUTE RESOLUTION AND GOVERNING LAW</ArticleTitle>

          <Paragraph>
            These Terms are governed by applicable law, and disputes are subject
            to arbitration and jurisdiction provisions.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE X */}
        <ArticleSection>
          <ArticleTitle>ARTICLE X - MODIFICATIONS TO THE SERVICE AND TERMS</ArticleTitle>

          <Paragraph>
            We may modify the Service or these Terms at any time, and continued
            use constitutes acceptance.
          </Paragraph>
        </ArticleSection>

        {/* ARTICLE XI */}
        <ArticleSection>
          <ArticleTitle>ARTICLE XI - GENERAL PROVISIONS</ArticleTitle>

          <Paragraph>
            These Terms contain standard provisions regarding assignment,
            severability, waiver, force majeure, and survival.
          </Paragraph>
        </ArticleSection>

        <LastUpdated>
          BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF
          SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM.
        </LastUpdated>
      </ContentWrapper>
    </PageContainer>
    <HeroContGrad style={{transform: "rotate(180deg)"}} />
    <Footer/>
    </>
  );
};

export default TermsOfService;