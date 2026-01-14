type EventHandler = (...args: any[]) => void;

class EventBus {
  private events = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler) {
    this.events.get(event)?.delete(handler);
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach((handler) => handler(...args));
  }
}

export const eventBus = new EventBus();
