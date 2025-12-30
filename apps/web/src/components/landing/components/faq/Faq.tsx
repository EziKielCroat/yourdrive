import React, { useState } from "react";
import { FaqCont, QCont, Question, Wrap, QText, Answear, FAQButton, FAQIcon } from "./styles/faq";
import {DetailDesc} from "../overview/styles/overview";

const Faq: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
    <FaqCont>
      <DetailDesc style={{marginBottom: "5%"}}>Frequently asked questions</DetailDesc>
      <QCont>
        <Question>
          <FAQButton onClick={()=>{setOpen(!open)}}>
            <Wrap>
              <QText>Is YourDrive free?</QText>
              <FAQIcon open={open} src="/SvgIcons/dropdown.svg"></FAQIcon> 
            </Wrap>
          </FAQButton>
          <Answear open={open}>
          Yes! YourDrive offers a free plan with essential features. You can upgrade to Pro for only €2/month to unlock unlimited storage and advanced tools.
          </Answear>
        </Question>
        <Question>
          <FAQButton onClick={()=>{setOpen(!open)}}>
            <Wrap>
              <QText>Who is YourDrive for?</QText>
              <FAQIcon open={open} src="/SvgIcons/dropdown.svg"></FAQIcon> 
            </Wrap>
          </FAQButton>
          <Answear open={open}>
          Anyone who wants to securely store, edit, and share files—students, freelancers, teams, or businesses.
          </Answear>
        </Question>
        <Question>
          <FAQButton onClick={()=>{setOpen(!open)}}>
            <Wrap>
              <QText>How secure is my data?</QText>
              <FAQIcon open={open} src="/SvgIcons/dropdown.svg"></FAQIcon> 
            </Wrap>
          </FAQButton>
          <Answear open={open}>
          YourDrive uses end-to-end encryption and multiple layers of protection to make sure your files stay private and safe.
          </Answear>
        </Question>
        <Question>
          <FAQButton onClick={()=>{setOpen(!open)}}>
            <Wrap>
              <QText>Can I share files with non-YourDrive users?</QText>
              <FAQIcon open={open} src="/SvgIcons/dropdown.svg"></FAQIcon> 
            </Wrap>
          </FAQButton>
          <Answear open={open}>
          Yes. You can share any file via a secure link, even if the recipient doesn’t have a YourDrive account.
          </Answear>
        </Question>
        <Question>
          <FAQButton onClick={()=>{setOpen(!open)}}>
            <Wrap>
              <QText>What devices and platforms are supported?</QText>
              <FAQIcon open={open} src="/SvgIcons/dropdown.svg"></FAQIcon> 
            </Wrap>
          </FAQButton>
          <Answear open={open}>
          YourDrive works on web, desktop, and mobile, so your files are always accessible wherever you are.
          </Answear>
        </Question>
        <Question>
          <FAQButton onClick={()=>{setOpen(!open)}}>
            <Wrap>
              <QText>Can I talk to customer support?</QText>
              <FAQIcon open={open} src="/SvgIcons/dropdown.svg"></FAQIcon> 
            </Wrap>
          </FAQButton>
          <Answear open={open}>
          Of course. You can reach us through live chat or email support anytime.
          </Answear>
        </Question>
      </QCont>
    </FaqCont>
    </>
  );
};

export default Faq;
