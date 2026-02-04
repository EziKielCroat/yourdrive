import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaqCont,
  QCont,
  Question,
  Wrap,
  QText,
  Answear,
  FAQButton,
  FAQIcon
} from "./styles/faq";

import { DetailDesc } from "../overview/styles/overview";

const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: "Is YourDrive free?",
      a: "Yes! YourDrive offers a free plan with essential features. You can upgrade to Pro for only €2/month to unlock unlimited storage and advanced tools."
    },
    {
      q: "Who is YourDrive for?",
      a: "Anyone who wants to securely store, edit, and share files—students, freelancers, teams, or businesses."
    },
    {
      q: "How secure is my data?",
      a: "YourDrive uses end-to-end encryption and multiple layers of protection to make sure your files stay private and safe."
    },
    {
      q: "Can I share files with non-YourDrive users?",
      a: "Yes. You can share any file via a secure link, even if the recipient doesn't have a YourDrive account."
    },
    {
      q: "What devices and platforms are supported?",
      a: "YourDrive works on web, desktop, and mobile, so your files are always accessible wherever you are."
    },
    {
      q: "Can I talk to customer support?",
      a: "Of course. You can reach us through live chat or email support anytime."
    }
  ];

  return (
    <>
    <FaqCont
      as={motion.div}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <DetailDesc 
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginBottom: "6.5%", margin:"auto", width:"fit-content"}}
      >
        Frequently asked questions
      </DetailDesc>
      <QCont>
        {faqs.map((item, i) => (
          <Question 
            key={i}
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <FAQButton onClick={() => toggle(i)}>
              <Wrap>
                <QText>{item.q}</QText>
                <FAQIcon open={openIndex === i} src="/SvgIcons/dropdown.svg" />
              </Wrap>
            </FAQButton>

            <Answear open={openIndex === i}>{item.a}</Answear>
          </Question>
        ))}
      </QCont>
    </FaqCont>
  </>
  );
}

export default Faq;