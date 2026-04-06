import styled from "styled-components";

export const PageWrapper = styled.div`
  min-height: 100%;
  overflow: visible;
  background: transparent;
  font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
`;

export const Container = styled.div`
  width: min(1140px, 100%);
  margin: 0 auto;
  padding: clamp(16px, 4vw, 28px) clamp(14px, 4vw, 24px) 88px;
  padding-left: max(clamp(14px, 4vw, 24px), env(safe-area-inset-left, 0px));
  padding-right: max(clamp(14px, 4vw, 24px), env(safe-area-inset-right, 0px));
  box-sizing: border-box;
  min-width: 0;
`;

export const Header = styled.div`
  margin-bottom: 1rem;
`;

export const Title = styled.h1`
  font-family: "Forma DJR Display", "Poppins", sans-serif;
  font-size: clamp(1.6rem, 2.2vw, 2rem);
  font-weight: 700;
  margin-bottom: 0.375rem;
  color: #0d1b2a;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  color: #5c6b7d;
  font-size: 0.9375rem;
  line-height: 1.5;
`;

export const TabsWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0.25rem;
  border: 1px solid #dbe7f4;
  border-radius: 14px;
  background: #f3f7fc;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

export const TabsList = styled.div`
  display: flex;
  gap: 0.375rem;
  min-width: max-content;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.85rem;
  border: none;
  border-radius: 10px;
  background: ${(props) => (props.$active ? "#ffffff" : "transparent")};
  color: ${(props) => (props.$active ? "#14314c" : "#52657a")};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease-out;
  white-space: nowrap;
  box-shadow: ${(props) => (props.$active ? "0 1px 2px rgba(15, 32, 58, 0.08)" : "none")};

  &:hover {
    background: ${(props) => (props.$active ? "#ffffff" : "#eaf1f9")};
    color: #20354c;
  }

  svg {
    flex-shrink: 0;
  }
`;

export const MainContent = styled.div`
  background: transparent;
  border-radius: 0;
  padding: 0.35rem 0 0.15rem;
  box-shadow: none;
  border: none;

  @media (max-width: 768px) {
    padding: 0.25rem 0 0.1rem;
  }
`;

export const Section = styled.div`
  margin-bottom: 1.7rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid #e4edf7;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

export const SectionTitle = styled.h2`
  font-family: "Forma DJR Display", "Poppins", sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  color: #102033;
  letter-spacing: -0.01em;
`;

export const SectionDescription = styled.p`
  color: #5c6b7d;
  font-size: 0.9375rem;
  margin-bottom: 1.25rem;
  line-height: 1.5;
`;

export const ProfilePictureWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
`;

export const Avatar = styled.div`
  width: 84px;
  height: 84px;
  background: linear-gradient(135deg, #1286fe 0%, #0d6efd 100%);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.9rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 12px 24px rgba(18, 134, 254, 0.24);
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
`;

export const Button = styled.button<{
  $variant?: "primary" | "danger" | "default";
}>`
  padding: 0.68rem 1.06rem;
  border: ${(props) =>
    props.$variant === "primary" ? "1px solid #1286fe" : "1px solid #d8e6f6"};
  border-radius: 11px;
  background: ${(props) => {
    if (props.$variant === "primary") return "#1286fe";
    if (props.$variant === "danger") return "#fff1f1";
    return "#ffffff";
  }};
  color: ${(props) => {
    if (props.$variant === "primary") return "#ffffff";
    if (props.$variant === "danger") return "#cc2f2f";
    return "#1b2d44";
  }};
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.18s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: ${(props) => {
      if (props.$variant === "primary") return "#0f74db";
      if (props.$variant === "danger") return "#ffe5e5";
      return "#f5f9ff";
    }};
    border-color: ${(props) =>
      props.$variant === "default" ? "#bfd7f2" : "transparent"};
    transform: translateY(-1px) scale(1.01);
    box-shadow: 0 8px 18px rgba(10, 42, 75, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SmallText = styled.p`
  color: #6f8093;
  font-size: 0.81rem;
  margin-top: 0.5rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.15rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.42rem;
  color: #1b2d44;

  span {
    color: #dc3b3b;
  }
`;

export const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 0.9rem;
  border: 1px solid #d7e5f5;
  border-radius: 11px;
  background: #ffffff;
  color: #16324b;
  font-size: 0.9375rem;
  transition: all 0.16s ease;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1286fe;
    box-shadow: 0 0 0 4px rgba(18, 134, 254, 0.12);
  }

  &::placeholder {
    color: #88a0b6;
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 44px;
  padding: 0 0.9rem;
  border: 1px solid #d7e5f5;
  border-radius: 11px;
  background: #ffffff;
  color: #16324b;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.16s ease;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1286fe;
    box-shadow: 0 0 0 4px rgba(18, 134, 254, 0.12);
  }
`;

export const GridTwo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const LinkedAccountCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e0ecf7;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #bfd7f2;
    box-shadow: 0 8px 18px rgba(10, 42, 75, 0.06);
  }
`;

export const LinkedAccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
`;

export const IconWrapper = styled.div`
  width: 44px;
  height: 44px;
  background: #eef5fc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const AccountDetails = styled.div``;

export const AccountName = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.125rem;
  color: #123050;
`;

export const AccountEmail = styled.p`
  color: #2f6ea7;
  font-size: 0.875rem;
`;

export const UnlinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  background: transparent;
  color: #5d6f84;
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 600;
  font-family: inherit;

  &:hover {
    background: #edf4fc;
    color: #20344a;
  }
`;

export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e8f0fa;

  &:last-child {
    border-bottom: none;
  }
`;

export const ToggleInfo = styled.div`
  flex: 1;
  padding-right: 1rem;
`;

export const ToggleTitle = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
  color: #17324a;
`;

export const ToggleDescription = styled.p`
  color: #5c6b7d;
  font-size: 0.875rem;
  line-height: 1.4;
`;

export const Toggle = styled.button<{ $active: boolean }>`
  width: 52px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: ${(props) => (props.$active ? "#1286FE" : "#cfd9de")};
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${(props) => (props.$active ? "25px" : "3px")};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    background: ${(props) => (props.$active ? "#0d6efd" : "#b8c5cf")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DangerZone = styled.div`
  border: 1px solid #f8d2d2;
  border-radius: 14px;
  padding: 1.25rem;
  background: #fff7f7;
`;

export const DangerItem = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.75rem 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

export const DangerInfo = styled.div``;

export const DangerTitle = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
  color: #183248;
`;

export const DangerDescription = styled.p`
  color: #5f6d7f;
  font-size: 0.875rem;
  line-height: 1.5;
`;

export const ContactEmail = styled.span`
  color: #1286fe;
  font-weight: 600;
`;

export const ThemeOptionWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

export const ThemeOption = styled.button<{ $active: boolean }>`
  padding: 1.25rem;
  border: 2px solid ${(props) => (props.$active ? "#1286FE" : "#e5eff9")};
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    border-color: #1286fe;
    box-shadow: 0 8px 20px rgba(18, 134, 254, 0.12);
  }

  svg {
    color: ${(props) => (props.$active ? "#1286FE" : "#536471")};
  }

  span {
    font-size: 0.9375rem;
    font-weight: 600;
    color: ${(props) => (props.$active ? "#1286FE" : "#0f1419")};
  }
`;

export const StorageBar = styled.div`
  width: 100%;
  height: 10px;
  background: #e4edf7;
  border-radius: 5px;
  overflow: hidden;
  margin: 1rem 0;
`;

export const StorageFill = styled.div<{ $percentage: number; color?: string }>`
  height: 100%;
  background: ${(props) =>
    props.color
      ? props.color
      : "linear-gradient(90deg, #1286fe 0%, #0d6efd 100%)"};
  width: ${(props) => Math.min(props.$percentage, 100)}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 5px;
`;

export const StorageInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #5e6e80;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const Divider = styled.div`
  height: 1px;
  background: #e8f0fa;
  margin: 1.5rem 0;
`;

export const InfoCard = styled.div`
  padding: 0.9rem 1rem;
  background: #f6f9fd;
  border: 1px solid #cce4fd;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

export const InfoText = styled.p`
  font-size: 0.875rem;
  color: #17324c;
  line-height: 1.5;

  strong {
    font-weight: 600;
  }
`;

export const SessionCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: 1px solid #e2ecf7;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c0d7f2;
    box-shadow: 0 8px 20px rgba(10, 42, 75, 0.06);
  }
`;

export const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
`;

export const SessionDetails = styled.div``;

export const SessionName = styled.p`
  font-weight: 600;
  font-size: 0.9375rem;
  margin-bottom: 0.125rem;
  color: #18334d;
`;

export const SessionMeta = styled.p`
  color: #5f7084;
  font-size: 0.875rem;
`;

export const Badge = styled.span<{ variant?: "success" | "warning" | "info" }>`
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    if (props.variant === "success") return "#dcfce7";
    if (props.variant === "warning") return "#fef3c7";
    if (props.variant === "info") return "#e8f5ff";
    return "#f7f9fa";
  }};
  color: ${(props) => {
    if (props.variant === "success") return "#15803d";
    if (props.variant === "warning") return "#a16207";
    if (props.variant === "info") return "#0d6efd";
    return "#0f1419";
  }};
`;