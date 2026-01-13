import styled from "styled-components";

export const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
`;

export const HiddenCheckbox = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #1F9AFE;
  }

  &:checked + span::before {
    transform: translateX(24px);
  }
`;

export const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: background-color 0.25s ease;
  border-radius: 999px;

  &::before {
    content: "";
    position: absolute;
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: transform 0.25s ease;
    border-radius: 50%;
  }
`;
