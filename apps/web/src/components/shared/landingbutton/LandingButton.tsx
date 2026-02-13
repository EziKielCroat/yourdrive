import React, { forwardRef, useEffect } from "react";
import { useAuthStore } from "../../../store/authStore";
import { StyledButton } from "./styles/landingButton.ts";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  purp?: "login" | "register" | "dashboard" | "howitworks" | "home";
  width?: string;
};

const LandingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      children,
      className,
      disabled,
      type = "button",
      purp,
      width,
      onClick,
      ...rest
    } = props;

    const isLoggedIn = () => {
      return useAuthStore.getState().isAuthenticated;
    };

    useEffect(() => {
      if (import.meta.env.VITE_DEBUG_MODE === "true") {
        console.log(
          `Button mounted with variant: ${variant} and size: ${size}`,
        );

        return () => {
          console.log("Button unmounted");
        };
      }
    }, [variant, size]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(event);
      }

      if (purp === "login") {
        window.location.href = "/login";
      } else if (purp === "register") {
        if (isLoggedIn()) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/register";
        }
      } else if (purp === "dashboard") {
        window.location.href = "/dashboard";
      } else if (purp === "howitworks") {
        window.location.href = "/howitworks";
      } else if (purp === "home") {
        window.location.href = "/";
      }
    };

    return (
      <StyledButton
        ref={ref}
        type={type}
        className={className}
        $variant={variant}
        $size={size}
        $width={width}
        onClick={handleClick}
        disabled={disabled}
        {...rest}
      >
        {children}
      </StyledButton>
    );
  },
);

LandingButton.displayName = "LandingButton";

export default LandingButton;