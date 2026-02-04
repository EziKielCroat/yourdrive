import styled, { css } from 'styled-components';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface StyledButtonProps {
  $variant: Variant;
  $size: Size;
  $width?: string;
}

const sizeStyles = {
  sm: css`
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    min-width: 80px;

    @media (max-width: 1024px) {
      font-size: 0.8125rem;
      padding: 0.2rem 0.45rem;
      min-width: 75px;
    }

    @media (max-width: 768px) {
      font-size: 0.75rem;
      padding: 0.2rem 0.4rem;
      min-width: 70px;
    }

    @media (max-width: 480px) {
      font-size: 0.7rem;
      padding: 0.15rem 0.35rem;
      min-width: 60px;
    }
  `,
  md: css`
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    min-width: 100px;

    @media (max-width: 1024px) {
      font-size: 0.8125rem;
      padding: 0.45rem 0.7rem;
      min-width: 95px;
    }

    @media (max-width: 768px) {
      font-size: 0.75rem;
      padding: 0.4rem 0.65rem;
      min-width: 90px;
    }

    @media (max-width: 480px) {
      font-size: 0.7rem;
      padding: 0.35rem 0.6rem;
      min-width: 80px;
    }
  `,
  lg: css`
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
    min-width: 140px;

    @media (max-width: 1024px) {
      font-size: 1.0625rem;
      padding: 0.7rem 1.35rem;
      min-width: 130px;
    }

    @media (max-width: 768px) {
      font-size: 1rem;
      padding: 0.65rem 1.25rem;
      min-width: 120px;
    }

    @media (max-width: 480px) {
      font-size: 0.9375rem;
      padding: 0.6rem 1rem;
      min-width: 100px;
    }
  `,
};

const variantStyles = {
  primary: css`
    background: linear-gradient(135deg, #3aadff 0%, #0d6efd 100%);
    color: #eff3fd;
    border: none;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.15);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      border-radius: 6px;
    }

    &:hover:not(:disabled)::before {
      opacity: 1;
    }
  `,
  secondary: css`
    background: #e3ecfa;
    color: #111;
    border: none;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      border-radius: 6px;
    }

    &:hover:not(:disabled)::before {
      opacity: 1;
    }
  `,
  ghost: css`
    background: #3a3c45;
    color: #eff3fd;
    border: none;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      border-radius: 6px;
    }

    &:hover:not(:disabled)::before {
      opacity: 1;
    }
  `,
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: 'Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif';
  font-style: normal;
  line-height: 1.5;
  font-weight: 500;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  width: ${({ $width }) => $width || 'auto'};
  
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}

  &:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.17);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid #3aadff;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    &:hover:not(:disabled) {
      transform: translateY(-0.5px) scale(1.01);
    }
  }

  @media (max-width: 480px) {
    box-shadow: 0px 0.5px 2px rgba(0, 0, 0, 0.15);
    
    &:hover:not(:disabled) {
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
  }
`;