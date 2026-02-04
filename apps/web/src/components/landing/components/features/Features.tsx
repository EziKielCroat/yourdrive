import React from "react";
import { motion } from "framer-motion";
import {SimpleDesc, DetailDesc} from "../overview/styles/overview";
import { FeaturesContainer, ImgNDescCont, ImgCont, Item, TextCont, Title, Desc, Wrap } from "./styles/features";
import Image from "../../../shared/image/Image";

const Features: React.FC = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <>
    <FeaturesContainer
      as={motion.div}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
    >
      <SimpleDesc 
        as={motion.div}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{marginLeft: "5%"}}
      >
        Seamlessly integrated with third-party file managers
      </SimpleDesc>
      <DetailDesc 
        as={motion.div}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{marginLeft: "5%"}}
      >
        Edit and manage files effortlessly via <span style={{color: "#0E84FF"}}>YourDrive</span>
      </DetailDesc>
      <ImgNDescCont
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Item as={motion.div} variants={itemVariants}>
          <ImgCont><Image src="/Images/Backgroundskib.png" height={426} width={406} /></ImgCont>
          <TextCont>
            <Wrap>
              <Title>Unlimited Sharing.</Title>
              <Desc>You can collaborate with</Desc>
            </Wrap>
            <Desc>anyone, anywhere all while being secure.</Desc> 
          </TextCont>
        </Item>
        <Item as={motion.div} variants={itemVariants}>
          <ImgCont><Image src="/Images/Background.png" height={426} width={406} /></ImgCont>
          <TextCont>
            <Wrap>
              <Title>Live Editing.</Title>
              <Desc>You can edit any file type you have</Desc>
            </Wrap>
            <Desc>with privacy focused Artifical Inteligence.</Desc>
          </TextCont>
        </Item>
        <Item as={motion.div} variants={itemVariants}>
          <ImgCont><Image src="/Images/Background-1.png" height={426} width={406} /></ImgCont>
          <TextCont>
            <Wrap>
              <Title>Never in your way.</Title>
              <Desc>YourDrive is designed as</Desc>
            </Wrap>
            <Desc>your go to platform with the simple and</Desc>
            <Desc>affordable features.</Desc>
          </TextCont>
        </Item>
      </ImgNDescCont>
    </FeaturesContainer>
    </>
  );
};

export default Features;