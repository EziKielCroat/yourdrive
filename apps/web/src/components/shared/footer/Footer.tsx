import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FooterCont,
  WrapperOne,
  BottomCont,
  RightsText,
  BackGround,
  ItemBox,
  Title,
  Link,
  SystemInfCont,
  SocialsWrapper,
} from "./styles/footer";
import Image from "../image/Image";
import { Github, Twitter, Youtube } from "lucide-react";
import api from "../../../lib/axios";

const Footer: React.FC = () => {
  const [isApiHealthy, setIsApiHealthy] = useState<boolean>(false);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await api.get("/health");
        setIsApiHealthy(response.data?.status === "OK");
      } catch {
        setIsApiHealthy(false);
      }
    };

    checkApiHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BackGround>
      <FooterCont
        as={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <WrapperOne>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Image src="/logo.svg" width={208} height={139} />
          </motion.div>
          <ItemBox
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Title>Resources</Title>
            <Link href="/pricing">Pricing</Link>
            <Link href="/features">Features</Link>
            <Link href="/guide">Guide</Link>
            <Link href="/api-docs">API Docs</Link>
            <Link href="/howitworks">How It Works</Link>
          </ItemBox>
          <ItemBox
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Title>Use Cases</Title>
            <Link href="/personal">Personal Storage</Link>
            <Link href="/team">Team Collaboration</Link>
            <Link href="/file-editing">File Sharing and File Editing</Link>
            <Link href="/secure">Secure Storage</Link>
          </ItemBox>
          <ItemBox
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Title>Company</Title>
            <Link href="/aboutus">About Us</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </ItemBox>
        </WrapperOne>
        {isApiHealthy && (
          <SystemInfCont>
            <Image src="/Images/Link.svg" width={185} height={34} />
          </SystemInfCont>
        )}
        <BottomCont>
          <RightsText>© 2026 NexaCore. All rights reserved.</RightsText>
          <SocialsWrapper>
            <a
              href="https://x.com/NexaCorehr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NexaCore on X"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://github.com/Nexacorehr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NexaCore on GitHub"
            >
              <Github size={20} />
            </a>
            <a
              href="https://youtube.com/@nexacorehr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NexaCore on YouTube"
            >
              <Youtube size={20} />
            </a>
          </SocialsWrapper>
        </BottomCont>
      </FooterCont>
    </BackGround>
  );
};

export default Footer;
