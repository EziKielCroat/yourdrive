import React from "react";
import { motion } from "framer-motion";
import {SimpleDesc} from "../overview/styles/overview";
import Image from "../../../shared/image/Image";
import {DescCont, Title, BlackText, Desc, Wrap, WrapText, ImageWrapper} from "./styles/description"

const Description: React.FC = () => {
  return (
    <>
    <DescCont
      as={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <SimpleDesc
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        You lose track of files more than you think
      </SimpleDesc>
      <Title>
        <Wrap
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <WrapText>
            <BlackText><span style={{color: "#0E84FF"}}>YourDrive</span> shows you</BlackText>
          </WrapText>
          <BlackText>where everything is</BlackText>
        </Wrap>
      </Title>
      <Desc
        as={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        After every upload, edit, or share, YourDrive helps you stay in control—whether you're working solo, collaborating with a team, or managing files across projects.
      </Desc>
      <ImageWrapper
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Image src="/Images/skibidi.png" width={1116} height={550} />
      </ImageWrapper>
    </DescCont>
    </>
    );
}

export default Description;