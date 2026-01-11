import { type JSX } from "react";

export const FileIcon = ({
  color = "#CAE7FD",
  width = "9",
  height = "11",
}: {
  color?: string;
  width?: string;
  height?: string;
}): JSX.Element => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 9 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.5 3.83333V8.72222C8.5 9.3445 8.5 9.65567 8.37543 9.89333C8.26589 10.1024 8.09103 10.2724 7.876 10.3789C7.63154 10.5 7.31149 10.5 6.67143 10.5H2.32857C1.68851 10.5 1.36848 10.5 1.12401 10.3789C0.908966 10.2724 0.734131 10.1024 0.624566 9.89333C0.5 9.65567 0.5 9.3445 0.5 8.72222V2.27778C0.5 1.65549 0.5 1.34436 0.624566 1.10668C0.734131 0.897606 0.908966 0.727628 1.12401 0.621106C1.36848 0.5 1.68851 0.5 2.32857 0.5H5.07143M8.5 3.83333L5.07143 0.5M8.5 3.83333H5.64286C5.32726 3.83333 5.07143 3.5846 5.07143 3.27778V0.5"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default FileIcon;
