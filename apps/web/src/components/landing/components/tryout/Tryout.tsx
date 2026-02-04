import React from "react";
import { motion } from "framer-motion";
import { TryoutContainer, Question, QuestionDesc, TryoutBox, TryoutBoxInstructions, TryoutBoxTextBox,TryoutBoxLimits, ImageWrapper} from "./styles/tryout";
import Image from "../../../shared/image/Image";

const Tryout: React.FC = () => {
  return (
    <>
    <TryoutContainer
      as={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
        <Question
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Want to try?
        </Question>
        <QuestionDesc
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          We offer all of our users sharing without a account on our platform, so they<br className="desktop-break" />can see how easy it is to share with us.
        </QuestionDesc>
        <TryoutBox
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <ImageWrapper><Image src="/SvgIcons/upload.svg" width={112} height={112}/></ImageWrapper>
          <TryoutBoxTextBox>
            <TryoutBoxInstructions>Drag-and-drop or click to upload a file</TryoutBoxInstructions>
            <TryoutBoxLimits>50 MB max*</TryoutBoxLimits>
          </TryoutBoxTextBox>
        </TryoutBox>
    </TryoutContainer>
    </>
  );
};

export default Tryout;