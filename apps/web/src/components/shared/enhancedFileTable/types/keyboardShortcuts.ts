import type { FileActionId } from "./fileActions";

export interface ShortcutDefinition {
  action: FileActionId | "selectAll" | "clearSelection";
  requiresPrefix: boolean;
  /** Human-readable label shown in the indicator toast while prefix is active. */
  description?: string;
}

/** Map keyed by the *normalised* key string (see `normaliseKey`). */
export type ShortcutMap = Record<string, ShortcutDefinition>;

export interface ActiveShortcutInfo {
  key: string;
  action: string;
  description: string;
}
