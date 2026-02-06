import React from "react";
import styled from "styled-components";
import PageTransition from "../shared/PageTransition";

const ApiDocs: React.FC = () => {
  return (
    <PageTransition>
      <Container>
        <Header>
          <Title>NexaCore API</Title>
          <Subtitle>
            Simple, secure endpoints for integrating file storage into your apps.
          </Subtitle>
        </Header>
        <Section>
          <SectionTitle>Authentication</SectionTitle>
          <CodeBlock>
            POST /api/auth/login{"\n"}
            Authorization: Bearer {"<token>"}
          </CodeBlock>
          <Text>
            Authenticate with a bearer token obtained from the dashboard. All API
            requests must be made over HTTPS.
          </Text>
        </Section>
        <Section>
          <SectionTitle>Upload Files</SectionTitle>
          <CodeBlock>
            POST /api/files/upload{"\n"}
            Content-Type: multipart/form-data
          </CodeBlock>
          <Text>
            Upload single or multiple files. For large uploads, use the multipart
            endpoints exposed in the app.
          </Text>
        </Section>
        <Section>
          <SectionTitle>List Files</SectionTitle>
          <CodeBlock>GET /api/files</CodeBlock>
          <Text>
            Returns a paginated list of files in the authenticated user&apos;s
            account.
          </Text>
        </Section>
      </Container>
    </PageTransition>
  );
};

const Container = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 16px 80px;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.header`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 15px;
`;

const Section = styled.section`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 8px 0;
`;

const Text = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
`;

const CodeBlock = styled.pre`
  background: #0b1120;
  color: #e5e7eb;
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  margin: 0 0 8px 0;
  overflow-x: auto;
`;

export default ApiDocs;

