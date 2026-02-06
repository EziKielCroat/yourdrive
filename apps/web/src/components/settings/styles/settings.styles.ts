import styled from "styled-components";

export const PageWrapper = styled.div`
  height: 100vh;
  overflow-y: auto;
  background: #fafbfc;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  padding-bottom: 80px;
`;

export const Header = styled.div`
  margin-bottom: 2rem;
`;

export const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f1419;
`;

export const Subtitle = styled.p`
  color: #536471;
  font-size: 0.9375rem;
`;

export const TabsWrapper = styled.div`
  border-bottom: 1px solid #eff3f4;
  margin-bottom: 2rem;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f7f9fa;
  }

  &::-webkit-scrollbar-thumb {
    background: #cfd9de;
    border-radius: 2px;
  }
`;

export const TabsList = styled.div`
  display: flex;
  gap: 0;
  min-width: max-content;
`;

export const TabButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  color: ${(props) => (props.active ? "#1286FE" : "#536471")};
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border-bottom: 3px solid
    ${(props) => (props.active ? "#1286FE" : "transparent")};
  position: relative;
  white-space: nowrap;

  &:hover {
    color: #1286fe;
    background: #f7f9fa;
  }

  svg {
    flex-shrink: 0;
  }
`;

export const MainContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #eff3f4;
`;

export const Section = styled.div`
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0f1419;
`;

export const SectionDescription = styled.p`
  color: #536471;
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

export const ProfilePictureWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
`;

export const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1286fe 0%, #0d6efd 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(18, 134, 254, 0.2);
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const Button = styled.button<{
  variant?: "primary" | "danger" | "default";
}>`
  padding: 0.625rem 1.25rem;
  border: ${(props) =>
    props.variant === "primary" ? "none" : "1px solid #cfd9de"};
  border-radius: 9999px;
  background: ${(props) => {
    if (props.variant === "primary") return "#1286FE";
    if (props.variant === "danger") return "#fee2e2";
    return "#ffffff";
  }};
  color: ${(props) => {
    if (props.variant === "primary") return "#ffffff";
    if (props.variant === "danger") return "#dc2626";
    return "#0f1419";
  }};
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: ${(props) => {
      if (props.variant === "primary") return "#0d6efd";
      if (props.variant === "danger") return "#fecaca";
      return "#f7f9fa";
    }};
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SmallText = styled.p`
  color: #8899a6;
  font-size: 0.8125rem;
  margin-top: 0.5rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #0f1419;

  span {
    color: #f91880;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cfd9de;
  border-radius: 12px;
  background: #ffffff;
  color: #0f1419;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #1286fe;
    box-shadow: 0 0 0 4px rgba(18, 134, 254, 0.1);
  }

  &::placeholder {
    color: #8899a6;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cfd9de;
  border-radius: 12px;
  background: #ffffff;
  color: #0f1419;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #1286fe;
    box-shadow: 0 0 0 4px rgba(18, 134, 254, 0.1);
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
  padding: 1rem 1.25rem;
  border: 1px solid #eff3f4;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cfd9de;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  background: #f7f9fa;
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
  color: #0f1419;
`;

export const AccountEmail = styled.p`
  color: #1286fe;
  font-size: 0.875rem;
`;

export const UnlinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  background: transparent;
  color: #536471;
  cursor: pointer;
  font-size: 0.875rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 600;
  font-family: inherit;

  &:hover {
    background: #f7f9fa;
    color: #0f1419;
  }
`;

export const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
  border-bottom: 1px solid #eff3f4;

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
  color: #0f1419;
`;

export const ToggleDescription = styled.p`
  color: #536471;
  font-size: 0.875rem;
  line-height: 1.4;
`;

export const Toggle = styled.button<{ active: boolean }>`
  width: 52px;
  height: 30px;
  border-radius: 15px;
  border: none;
  background: ${(props) => (props.active ? "#1286FE" : "#cfd9de")};
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${(props) => (props.active ? "25px" : "3px")};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    background: ${(props) => (props.active ? "#0d6efd" : "#b8c5cf")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DangerZone = styled.div`
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 1.5rem;
  background: rgba(254, 226, 226, 0.3);
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
  color: #0f1419;
`;

export const DangerDescription = styled.p`
  color: #536471;
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

export const ThemeOption = styled.button<{ active: boolean }>`
  padding: 1.25rem;
  border: 2px solid ${(props) => (props.active ? "#1286FE" : "#eff3f4")};
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
    box-shadow: 0 2px 8px rgba(18, 134, 254, 0.1);
  }

  svg {
    color: ${(props) => (props.active ? "#1286FE" : "#536471")};
  }

  span {
    font-size: 0.9375rem;
    font-weight: 600;
    color: ${(props) => (props.active ? "#1286FE" : "#0f1419")};
  }
`;

export const StorageBar = styled.div`
  width: 100%;
  height: 10px;
  background: #eff3f4;
  border-radius: 5px;
  overflow: hidden;
  margin: 1rem 0;
`;

export const StorageFill = styled.div<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #1286fe 0%, #0d6efd 100%);
  width: ${(props) => Math.min(props.percentage, 100)}%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 5px;
`;

export const StorageInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #536471;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const Divider = styled.div`
  height: 1px;
  background: #eff3f4;
  margin: 1.5rem 0;
`;

export const InfoCard = styled.div`
  padding: 1rem 1.25rem;
  background: #e8f5ff;
  border: 1px solid #b3dcff;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

export const InfoText = styled.p`
  font-size: 0.875rem;
  color: #0f1419;
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
  border: 1px solid #eff3f4;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cfd9de;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  color: #0f1419;
`;

export const SessionMeta = styled.p`
  color: #536471;
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