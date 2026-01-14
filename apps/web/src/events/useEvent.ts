import { useEffect } from "react";
import { eventBus } from "./eventBus";

export function useEvent(eventName: string, handler: (...args: any[]) => void) {
  useEffect(() => {
    const unsubscribe = eventBus.on(eventName, handler);
    return unsubscribe;
  }, [eventName, handler]);
}
