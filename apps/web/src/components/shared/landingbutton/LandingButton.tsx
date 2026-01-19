import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "../../../store/authStore";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
  purp?: "login" | "register" | "dashboard" | "howitworks";
  width?: string;
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: {
    padding: "4px 4px",
    fontSize: 14,
    height: "60%",
    width: "17%",
    justifyContent: "center",
    fontFamily:
      "'Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'",
    fontStyle: "normal",
    lineHeight: 1.5,
    fontWeight: 500,
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
  },
  md: {
    padding: "8px 12px",
    fontSize: 14,
    justifyContent: "center",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
  },
  lg: {
    padding: "12px 0",
    fontSize: 18,
    justifyContent: "center",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
  },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: "#1F9AFE",
    color: "#EFF3FD",
    border: "1px solid rgba(0,0,0,0.1)",
  },
  secondary: {
    backgroundColor: "#EFF3FD",
    color: "#111",
    border: "1px solid rgba(0,0,0,0.08)",
  },
  ghost: {
    backgroundColor: "#363840",
    color: "#EFF3FD",
    border: "1px solid transparent",
  },
};

const getHoverStyle = (variant: Variant) => {
  switch (variant) {
    case "primary":
      return `
        background: linear-gradient(140deg, rgba(57, 133, 215, 0.9) 4%, rgba(16, 133, 255, 1) 50%) !important;
      `;
    case "secondary":
      return `
        background: rgba(239, 243, 253, 0.8) !important;
      `;
    case "ghost":
      return `
        background: rgba(54, 56, 64, 0.8) !important;
      `;
  }
};

const LandingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      children,
      style,
      className,
      disabled,
      type = "button",
      purp,
      width,
      ...rest
    } = props;

    const buttonIdRef = useRef(
      `btn-${Math.random().toString(36).substr(2, 9)}`,
    );
    const buttonId = buttonIdRef.current;

    const combinedStyle: React.CSSProperties = useMemo(
      () => ({
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ...sizeStyles[size],
        backgroundColor: variantStyles[variant].backgroundColor,
        color: variantStyles[variant].color,
        border: variantStyles[variant].border,
        ...(disabled && { opacity: 0.6 }),
        ...style,
      }),
      [size, variant, disabled, style],
    );

    const isLoggedIn = () => {
      return useAuthStore.getState().isAuthenticated;
    };

    useEffect(() => {
      if (import.meta.env.VITE_DEBUG_MODE === "true") {
        console.log(
          `Button mounted with variant: ${variant} and size: ${size}`,
        );
        console.log(combinedStyle);

        return () => {
          console.log("Button unmounted");
        };
      }
    }, [variant, size, combinedStyle]);

    function onclick(purps?: string) {
      if (purps === "login") {
        return () => {
          window.location.href = "/login";
        };
      }
      if (purps === "register") {
        if (isLoggedIn()) {
          return () => {
            window.location.href = "/dashboard";
          };
        }
        return () => {
          window.location.href = "/register";
        };
      }
      if (purps === "dashboard") {
        return () => {
          window.location.href = "/dashboard";
        };
      }
      if (purps === "howitworks") {
        return () => {
          window.location.href = "/howitworks";
        };
      }
      return undefined;
    }

    return (
      <>
        <style>
          {`
          #${buttonId}:hover:not(:disabled) {
            transform: translateY(-1px) scale(1.02);
            ${getHoverStyle(variant)}
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.17) !important;
          }
        `}
        </style>
        <button
          id={buttonId}
          ref={ref}
          type={type}
          className={className}
          style={width ? { ...combinedStyle, width: width } : combinedStyle}
          onClick={onclick(purp)}
          disabled={disabled}
          {...rest}
        >
          {children}
        </button>
      </>
    );
  },
);

LandingButton.displayName = "LandingButton";

export default LandingButton;
