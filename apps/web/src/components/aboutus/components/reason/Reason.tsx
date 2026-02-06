import React from "react";
import { motion } from "framer-motion";
import { 
  Title, 
  ReasonCont, 
  SubTitle, 
  InfoWrapper, 
  TextWrapper,
  ImageWrapper,
  TextBlock,
  ValuesSection,
  ValuesTitle,
  ValuesSubtitle,
  Highlight,
  StyledSubTitle,
  MainText,
  HighlightText
} from "./styles/reason";
import Image from "../../../shared/image/Image";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const Reason: React.FC = () => {
  return (
    <ReasonCont>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Title>
          Why We Built <Highlight>NexaCore</Highlight>
        </Title>
        <StyledSubTitle>
          Born from the frustration of scattered files
        </StyledSubTitle>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
      >
        <InfoWrapper>
          <motion.div 
            variants={fadeInUp} 
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <TextWrapper>
              <TextBlock>
                <MainText>
                  From classrooms to startups, we've all experienced the pain of juggling too many tools and losing track of files.
                </MainText>
                <HighlightText>
                  <Highlight>NexaCore</Highlight> was created to bring everything together in one simple, private, and polished space—so you can focus on what matters, not where your files are.
                </HighlightText>
              </TextBlock>
            </TextWrapper>
          </motion.div>

          <motion.div 
            variants={fadeInUp} 
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageWrapper>
              <Image 
                src="./Images/aboutUs.jpg" 
                width={878} 
                height={625}
                alt="NexaCore illustration"
              />
            </ImageWrapper>
          </motion.div>
        </InfoWrapper>
      </motion.div>
    </ReasonCont>
  );
};

export default Reason;