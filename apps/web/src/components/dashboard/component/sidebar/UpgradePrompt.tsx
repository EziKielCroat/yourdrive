import {
  UpgradeWrapper,
  ProgressBar,
  ProgressFill,
  UsageText,
  UpgradeButton,
} from "../../styles/sidebar";

interface UpgradePromptProps {
  used: string;
  total: string;
  percentage: number;
  onUpgrade?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  used,
  total,
  percentage,
  onUpgrade,
}) => {
  return (
    <UpgradeWrapper data-tour="tour-storage">
      <ProgressBar>
        <ProgressFill percentage={percentage} />
      </ProgressBar>

      <UsageText>
        Used <span>{used}</span> of {total}
      </UsageText>

      <UpgradeButton onClick={onUpgrade}>Upgrade Now</UpgradeButton>
    </UpgradeWrapper>
  );
};

export default UpgradePrompt;
