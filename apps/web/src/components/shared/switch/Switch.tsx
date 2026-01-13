import React from "react";
import { SwitchWrapper, HiddenCheckbox, Slider } from "./styles/switch";

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <SwitchWrapper>
      <HiddenCheckbox
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Slider />
    </SwitchWrapper>
  );
};

export default Switch;
