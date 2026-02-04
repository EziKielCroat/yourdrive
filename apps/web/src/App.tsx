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

    // Add a small delay then test the toast system
    setTimeout(() => {
      toast.success("Application loaded successfully!");
    }, 500);

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
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
  overflow-y: hidden;
`;

export default Application;
