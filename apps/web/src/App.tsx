import { type ReactNode, useEffect } from "react";
import styled from "styled-components";
import ToastManager from "./components/toast/ToastManager";
import { toast } from "./services/toast.service";

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
    // Initialize the toast service
    toast.initialize();

    // Expose toast globally for debugging
    window.toast = toast;

    return () => {
      delete window.toast;
    };
  }, []);

  return (
    <>
      <ApplicationContainer>{children}</ApplicationContainer>
      <ToastManager />
    </>
  );
};

const ApplicationContainer = styled.div`
  flex: 1;
  position: relative;

  overflow-y: hidden;
  overflow-x: hidden;
`;

export default Application;
