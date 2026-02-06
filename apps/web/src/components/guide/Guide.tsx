import React from "react";
import styled from "styled-components";
import PageTransition from "../shared/PageTransition";

const Guide: React.FC = () => {
  return (
    <PageTransition>
      <Container>
        <Header>
          <Title>User Guide</Title>
          <Subtitle>How to use NexaCore: files, sharing, and settings.</Subtitle>
        </Header>

        <Section>
          <SectionTitle>Dashboard & navigation</SectionTitle>
          <Text>
            From the sidebar you can open <strong>Your Files</strong> (all your files and folders),
            <strong> Shared with you</strong> (files others have shared with you), <strong>Favorites</strong> (starred files),
            and <strong>Recycle Bin</strong> (deleted files you can restore). Use the search and filters at the top to find files quickly.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Uploading & organizing</SectionTitle>
          <Text>
            Upload files by dragging and dropping into the file list or using the upload button. Create folders to organize content;
            you can nest folders and move files by drag and drop or via the file actions menu. Rename, move, or delete files from the same menu.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Sharing files</SectionTitle>
          <Text>
            Select a file and use the share action to create a shareable link. You can set the permission (view only, comment, edit, or download),
            add an optional password, and set an expiration date or download limit. Copy the link and send it to anyone; they can open it in a browser
            at <strong>/shared/[link]</strong> to view or interact based on the permission. You can revoke or edit existing links from the share dialog or from Settings → Sharing.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Viewing shared links</SectionTitle>
          <Text>
            When someone opens a shared link, they see a preview page: they can view the file, leave comments (if allowed), edit text files (if edit is allowed),
            or download (if download is allowed). Password-protected links require the password before showing the file.
          </Text>
        </Section>

        <Section>
          <SectionTitle>Devices & account</SectionTitle>
          <Text>
            In <strong>Settings → Devices</strong> you can see all devices that have accessed your account and revoke access for any device.
            Under Settings you can also manage your profile, security options (including two-factor authentication), and sharing preferences (e.g. default link permissions, password requirements).
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

export default Guide;
