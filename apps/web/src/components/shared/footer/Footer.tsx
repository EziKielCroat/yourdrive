import React from "react";
import { FooterCont, WrapperOne, IconWrapper, IconText, BottomCont, RightsText, BackGround, ItemBox, Title, Link, SystemInfCont, SocialsWrapper } from "./styles/footer";
import Image from "../image/Image";

const Footer: React.FC = () => {
  return (
    <BackGround>
      <FooterCont>
        <WrapperOne>
          <Image src="/logo.svg" width={208} height={139} />
          <ItemBox>
            <Title>Resources</Title>
            <Link href="/pricing">Pricing</Link>
            <Link href="/features">Features</Link>
            <Link href="/guide">Guide</Link>
            <Link href="/api-docs">API Docs</Link>
          </ItemBox>
          <ItemBox>
            <Title>Support</Title>
            <Link href="/helpcenter">Help Center</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/status">System Status</Link>
          </ItemBox>
          <ItemBox>
            <Title>Use Cases</Title>
            <Link href="/personal">Personal Storage</Link>
            <Link href="/team">Team Collaboration</Link>
            <Link href="/file-editing">File Sharing and File Editing</Link>
            <Link href="/secure">Secure Storage</Link>
          </ItemBox>
          <ItemBox>
            <Title>Legal</Title>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </ItemBox>
        </WrapperOne>
        <SystemInfCont>
          <Image src="/Images/Link.svg" width={185} height={34}></Image>
        </SystemInfCont>
        <IconWrapper>
          <Image src="/Images/CCPA.svg" width={52} height={52}></Image>
          <Image src="/Images/CCPA.svg" width={52} height={52}></Image>
          <Image src="/Images/CCPA.svg" width={52} height={52}></Image>
          <Image src="/Images/CCPA.svg" width={52} height={52}></Image>
          <Image src="/Images/CCPA.svg" width={52} height={52}></Image>
        </IconWrapper>
        <IconText>
          *In observation period for SOC 2 Type II compliance. List of subprocessors.
        </IconText>
        <BottomCont>
          <RightsText>
            © 2026 YourDrive. All rights reserved.
          </RightsText>
          <SocialsWrapper>
            <Image src="/Images/github.svg" width={20} height={20}></Image>
            <Image src="/Images/github.svg" width={20} height={20}></Image>
            <Image src="/Images/github.svg" width={20} height={20}></Image>
            <Image src="/Images/github.svg" width={20} height={20}></Image>
          </SocialsWrapper>
        </BottomCont>
      </FooterCont>
    </BackGround>
  );
};

export default Footer;
