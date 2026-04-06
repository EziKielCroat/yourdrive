const TOUR_VERSION = "v2";

export function getTourStorageKey(userId: string): string {
  return `yourdrive_dashboard_tour_${TOUR_VERSION}_${userId}`;
}

export function isDashboardTourCompleted(userId: string | undefined): boolean {
  if (!userId || typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(getTourStorageKey(userId)) === "1";
  } catch {
    return true;
  }
}

export function markDashboardTourCompleted(userId: string): void {
  try {
    window.localStorage.setItem(getTourStorageKey(userId), "1");
  } catch {
    /* ignore quota */
  }
}
