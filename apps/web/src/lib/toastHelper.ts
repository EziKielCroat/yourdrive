import { toast } from "../services/toast.service";

const TOAST_TIMEOUT = 5000; // 5 seconds max wait

export async function ensureToastReady(): Promise<boolean> {
  if (toast["callbacks"] && toast["callbacks"].length > 0) {
    return true;
  }

  return new Promise((resolve) => {
    const startTime = Date.now();

    const checkInterval = setInterval(() => {
      if (toast["callbacks"] && toast["callbacks"].length > 0) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > TOAST_TIMEOUT) {
        clearInterval(checkInterval);
        console.warn("Toast system not ready after timeout");
        resolve(false);
      }
    }, 100);
  });
}

export async function safeToast(
  fn: () => void,
  fallbackMessage?: string,
): Promise<void> {
  const isReady = await ensureToastReady();

  if (isReady) {
    fn();
  } else if (fallbackMessage) {
    console.log("Toast (not displayed):", fallbackMessage);
    alert(fallbackMessage);
  }
}
