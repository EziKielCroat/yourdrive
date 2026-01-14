import { type JSX } from "react";

const InfoIcon = ({ color = "#CAE7FD" }: { color?: string }): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      color={color}
      d="M256 0A256 256 0 1 0 512 256 256 256 0 0 0 256 0zm0 384a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm32-128a32 32 0 0 1-64 0V128a32 32 0 0 1 64 0z"
    />
  </svg>
);

export default InfoIcon;
