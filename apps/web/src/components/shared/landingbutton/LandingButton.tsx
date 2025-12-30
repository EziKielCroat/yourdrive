import React, { forwardRef, useEffect } from "react";
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

const LandingButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
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

  const sizeStyles: Record<Size, React.CSSProperties> = {
    sm: { 
        padding: "4px 4px", 
        fontSize: 14, 
        height: "60%",
        width: "17%", 
        justifyContent: "center",
        fontFamily: "'Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'",
        fontStyle: "normal",
        lineHeight: 1.5,
        fontWeight: 500,
        boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
    },
    md: { padding: "8px 12px", fontSize: 14 , justifyContent: "center",},
    lg: { padding: "12px 0", fontSize: 18, justifyContent: "center", },
  };

  const variantStyles: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: "#0366d6",
      color: "#EFF3FD",
      border: "1px solid rgba(0,0,0,0.1)",
    },
    secondary: {
      backgroundColor: "#EFF3FD",
      color: "#111",
      border: "1px solid rgba(0,0,0,0.08)",
    },
    ghost: {
      backgroundColor: "rgba(0, 0, 0, 0.80)",
      color: "#EFF3FD",
      border: "1px solid transparent",
    },
  };

  const combinedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };
  const isLoggedIn = () => {
      return useAuthStore.getState().isAuthenticated;
  };
  useEffect(() => {
    if (import.meta.env.VITE_DEBUG_MODE === "true") {
      console.log(`Button mounted with variant: ${variant} and size: ${size}`);
      console.log(combinedStyle);

      return () => {
        console.log("Button unmounted");
      };
    }
  }, [variant, sizeStyles]);
  function onclick(purps?: string) {
    if (purps === "login") {
      return () => {
        window.location.href = "/login";
      }
    }
    if (purps === "register") {
      if (isLoggedIn()) {
        return () => {
          window.location.href = "/dashboard";
        }
      }
      return () => {
        window.location.href = "/register";
      }
    }
    if (purps === "dashboard") {
      return () => {
        window.location.href = "/dashboard";
      }
    }
    if (purps === "howitworks") {
      return () => {
        window.location.href = "/howitworks";
      }
    }
    return undefined;
  }
  
  return (
    <button
      ref={ref}
      type={type}
      className={className}
      style={width ? { ...combinedStyle, width: width} : combinedStyle}
      onClick={onclick(purp)}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

export default LandingButton;
