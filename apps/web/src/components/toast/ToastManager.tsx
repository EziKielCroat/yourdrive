import { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { toast, type ToastOptions } from "../../services/toast.service";
import Toast from "./Toast.tsx";

interface ToastItem extends ToastOptions {
  id: string;
}

const ToastManager = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);

  const toastCallback = useCallback((options: ToastOptions) => {
    const id = crypto.randomUUID();
    console.log("ToastManager: Showing toast", options);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  useEffect(() => {
    console.log("ToastManager: Registering toast callback");

    // Register the toast callback
    toast.register(toastCallback);
    setIsRegistered(true);

    // Clean up function
    return () => {
      console.log("ToastManager: Unregistering toast callback");
      toast.unregister(toastCallback);
      setIsRegistered(false);
    };
  }, [toastCallback]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {isRegistered && (
        <Container>
          {toasts.map((toastItem) => (
            <Toast
              key={toastItem.id}
              {...toastItem}
              onClose={() => removeToast(toastItem.id)}
            />
          ))}
        </Container>
      )}
    </>
  );
};

export default ToastManager;

const Container = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
`;
