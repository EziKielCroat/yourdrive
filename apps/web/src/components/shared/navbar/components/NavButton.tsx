import React from "react";
import styled from "styled-components";
import Button, { type ButtonProps } from "../../button/Button";

type NavButtonProps = ButtonProps & {
  onClick?: () => void;
};

const StyledNavButton = styled(Button).attrs({
  size: "sm",
})<{ className?: string }>`
  width: 35px;
  height: 35px;
  padding: 0 !important;
  font-size: 16px;
  border-radius: 6px;
  border: none !important;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(
    320deg,
    rgba(77, 163, 255, 0.9) 4%,
    rgba(16, 133, 255, 1) 50%
  );

  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    filter 120ms ease;
  will-change: transform;

  &:hover {
    transform: translateY(-1px) scale(1.02);
    background: linear-gradient(
      140deg,
      rgba(57, 133, 215, 0.9) 4%,
      rgba(16, 133, 255, 1) 50%
    );
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.17);
    filter: brightness(1.03);
  }

  /* Desktop only - show by default */
  &.desktop-only {
    display: inline-flex !important;
  }

  /* Mobile only - hide by default */
  &.mobile-only {
    display: none !important;
  }

  /* Mobile breakpoint */
  @media (max-width: 768px) {
    &.desktop-only {
      display: none !important;
    }

    &.mobile-only {
      display: inline-flex !important;
    }
  }
`;

const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
  ({ onClick, children, className, ...props }, ref) => {
    return (
      <StyledNavButton
        onClick={onClick}
        ref={ref}
        className={className}
        {...props}
      >
        {children}
      </StyledNavButton>
    );
  },
);

export default NavButton;
