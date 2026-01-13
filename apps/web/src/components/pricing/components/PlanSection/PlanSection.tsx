import { Cont, BlueTitle, SwitchCont, Title, PlanWrapper, Option } from "./styles/PlanSection";
import Plan from "./components/plan/Plan";
import Switch from "../../../shared/switch/Switch";
import React, { useState } from "react";

const PlanSection: React.FC = () => {
  const [yearly, setYearly] = useState(false);

  type PlanItem = {
    planTitle: string;
    price: number | string;
    special: boolean;
    capabilities: string[];
  };

  const Plans: PlanItem[] = [
    {
      planTitle: "Free Plan",
      price: 0,
      special: false,
      capabilities: [
        "Upload, edit & share files",
        "Real-time collaboration",
        "Secure cloud storage (20 GB)",
        "Access from any device",
        "Basic support",
      ]
    },
    {
      planTitle: "Pro Plan",
      price: 10,
      special: true,
      capabilities: [
        "Everything in Free, plus:",
        "Increased storage capacity (50 GB)",
        "Advanced file editing tools",
        "Version history & recovery",
        "Priority customer support",
      ]
    },
    {
      planTitle: "Investor Plan",
      price: '?',
      special: false,
      capabilities: [
        "Early Feature Access",
        "Extended Cloud Resources (Not Limited)",
        "Personalized Development",
        "Concierge Onboarding",
        "Beta Sandbox Environment",
      ]
    },
  ];

  return (
    <Cont>
      <BlueTitle>Pricing & Plans</BlueTitle>
      <Title>
        We have exclusive plans for you to
        <br />
        choose
      </Title>

      <SwitchCont>
        <Option>Monthly</Option>
        <Switch checked={yearly} onChange={setYearly} />
        <Option>Yearly</Option>
      </SwitchCont>

      <PlanWrapper>
        {Plans.map((plan) => (
          <Plan key={plan.planTitle} year={yearly} plan={plan} />
        ))}
      </PlanWrapper>
    </Cont>
  );
};

export default PlanSection;
