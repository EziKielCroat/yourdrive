import { type ReactNode, useEffect } from "react";
import styled, { ThemeProvider } from "styled-components";
import ToastManager from "./components/toast/ToastManager";
import { toast } from "./services/toast.service";
import { theme } from "./theme/theme";

interface ApplicationProps {
  children: ReactNode;
}

declare global {
  interface Window {
    toast?: typeof toast;
  }
}

const Application = ({ children }: ApplicationProps) => {
  useEffect(() => {
    toast.initialize();
    window.toast = toast;
    return () => {
      delete window.toast;
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ApplicationContainer>{children}</ApplicationContainer>
      <ToastManager />
    </ThemeProvider>
  );
};

const ApplicationContainer = styled.div`
  flex: 1;
  position: relative;

  overflow-y: hidden;
  overflow-x: hidden;
`;

export default Application;
