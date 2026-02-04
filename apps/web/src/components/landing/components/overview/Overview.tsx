import React from "react";
import { motion } from "framer-motion";
import { OverviewContainer, SimpleDesc, ItemCont, DetailDesc, Item, ImgCont } from "./styles/overview";
import Image from "../../../shared/image/Image";

const Overview: React.FC = () => {
  return (
    <>
    <OverviewContainer
      as={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <SimpleDesc
        as={motion.div}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Stores everything securely
      </SimpleDesc>
      <DetailDesc
        as={motion.div}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Open, edit, and update documents,<br className="desktop-break" />images, videos, and more - no<br className="desktop-break" />downloads or extra software needed.
      </DetailDesc>
      <ItemCont
        as={motion.div}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Item><Image src="/SvgIcons/UE.svg" width={18} height={18}/>Universal Editor</Item>
        <Item><Image src="/SvgIcons/IP.svg" width={18} height={18} /><span style={{color:"rgb(14, 132, 255)"}}>Instant previews</span></Item>
        <Item><Image src="/SvgIcons/US.svg" width={18} height={18} />Universal Search</Item>
      </ItemCont>
    </OverviewContainer>
    <ImgCont
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
        <Image src="/Images/skibidi.png" width={1116} height={550} />
    </ImgCont>
    </>
  );
};

export default Overview;