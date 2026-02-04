import type { ToastOptions } from "../../services/toast.service";

let toastCallback: ((options: ToastOptions) => void) | null = null;

export const setToastCallback = (callback: (options: ToastOptions) => void) => {
  toastCallback = callback;
};

export const showToast = (options: ToastOptions) => {
  if (toastCallback) {
    toastCallback(options);
  } else {
    console.warn("Toast callback not set. Message:", options.message);
  }
};

export const toast = {
  success: (message: string) => showToast({ type: "success", message }),
  error: (message: string) => showToast({ type: "error", message }),
  info: (message: string) => showToast({ type: "info", message }),
  warning: (message: string) => showToast({ type: "warning", message }),
};

export const clearToastCallback = () => {
  toastCallback = null;
};
