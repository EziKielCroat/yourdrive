import React, { forwardRef, useEffect } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: React.ReactNode;
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
    md: { padding: "8px 12px", fontSize: 14 },
    lg: { padding: "12px 18px", fontSize: 16 },
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
      backgroundColor: "transparent",
      color: "#0366d6",
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

  useEffect(() => {
    if (import.meta.env.VITE_DEBUG_MODE === "true") {
      console.log(`Button mounted with variant: ${variant} and size: ${size}`);
      console.log(combinedStyle);

      return () => {
        console.log("Button unmounted");
      };
    }
  }, [variant, sizeStyles]);

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      style={combinedStyle}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
});

export default LandingButton;
