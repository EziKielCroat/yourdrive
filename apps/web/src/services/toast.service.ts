type ToastOptions = {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number | "3000";
};

type ToastCallback = (options: ToastOptions) => void;

class ToastService {
  private static instance: ToastService;
  private callbacks: ToastCallback[] = [];
  private queue: ToastOptions[] = [];
  private isInitialized = false;

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Flush any queued toasts
    setTimeout(() => {
      this.queue.forEach((options) => this.show(options));
      this.queue = [];
    }, 100);
  }

  register(callback: ToastCallback): void {
    this.callbacks.push(callback);
    this.initialize();
  }

  unregister(callback: ToastCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  show(options: ToastOptions): void {
    // If no callbacks registered yet, queue the toast
    if (this.callbacks.length === 0) {
      this.queue.push(options);
      console.log("Toast queued, waiting for callback", options);
      return;
    }

    // Call all registered callbacks
    this.callbacks.forEach((callback) => {
      try {
        callback(options);
      } catch (error) {
        console.error("Toast callback error:", error);
      }
    });
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: "success", duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: "error", duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: "info", duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: "warning", duration });
  }

  dismiss(): void {
    // No-op for API compatibility
  }
}

export const toast = ToastService.getInstance();
export type { ToastOptions };
