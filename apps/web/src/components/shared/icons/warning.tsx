import { type JSX } from "react";

const WarningIcon = ({
  color = "#CAE7FD",
}: {
  color?: string;
}): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
    <path
      color={color}
      d="M569.5 440.6 327.4 48.5c-18.3-28.5-62.5-28.5-80.8 0L6.6 440.6C-12 469.2 9.4 512 47.5 512h481c38.1 0 59.5-42.8 41-71.4zM288 176c13.3 0 24 10.7 24 24v112c0 13.3-10.7 24-24 24s-24-10.7-24-24V200c0-13.3 10.7-24 24-24zm0 224a32 32 0 1 0 32 32 32 32 0 0 0-32-32z"
    />
  </svg>
);

export default WarningIcon;
