import { PLANS } from "@yourdrive/plans";
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
  const displayAmount =
    plan.planTitle === "Investor Plan"
      ? null
      : typeof plan.price === "number"
        ? plan.price === 0
          ? 0
          : !year
            ? plan.price
            : plan.price * 12 - PLANS.yearlyDiscountEur
        : null;

  const priceLabel =
    plan.planTitle === "Investor Plan"
      ? plan.price
      : displayAmount === null
        ? plan.price
        : `${PLANS.currencySymbol}${displayAmount}`;

  return (
    <Cont main={!plan.special}>
      <PlanTitle>{plan.planTitle}</PlanTitle>
      <PlanPrice>{priceLabel}</PlanPrice>
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