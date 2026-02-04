import { Cont, BoxLink, PlanTitle, PlanPrice, TimeText, CapText } from "./styles/plan";
import LandingButton from "../../../../../shared/landingbutton/LandingButton";

interface PlanItem {
  planTitle: string;
  price: number | string;
  special: boolean;
  capabilities: string[];
}

interface PlanProps {
  year: boolean;
  plan: PlanItem;
}

const Plan = ({ year, plan }: PlanProps) => {
  return (
    <Cont main={!plan.special}>
      <PlanTitle>{plan.planTitle}</PlanTitle>
      <PlanPrice>${!year ? plan.price : ((typeof plan.price === 'number' && plan.price !== 0) ? plan.price * 12 - 20 : plan.price)}</PlanPrice>
      <TimeText>{year ? "Per Year" : "Per Month"}</TimeText>
      {plan.capabilities.map((cap, index) => (
        <CapText key={index}>{cap}</CapText>
      ))}
      <BoxLink to="/register">
        <LandingButton variant="primary" size="lg" style={{padding: "8px 12px"}}>Get Started</LandingButton>
      </BoxLink>
    </Cont>
  );
};

export default Plan;