import { useSyncExternalStore } from "react";
import { applyGamification, type GameEvent } from "./gamify";
import { emptyState, parseState, STORAGE_KEY, type AppState } from "./state";

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseState(JSON.parse(raw)) : emptyState();
  } catch {
    // Corrupt or unavailable storage: start empty rather than crash. The bad value stays in
    // storage untouched until the next successful save.
    return emptyState();
  }
}

let current: AppState = load();
let saveError: string | null = null;
const listeners = new Set<() => void>();

function persist(next: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    saveError = null;
  } catch (e) {
    saveError = e instanceof Error ? e.message : "save_failed";
  }
}

const eventListeners = new Set<(events: GameEvent[]) => void>();

function commit(next: AppState): void {
  current = next;
  persist(current);
  listeners.forEach((l) => l());
}

/** Apply a change. XP, quests and badges are derived from the change itself (see gamify.ts). */
export function update(fn: (s: AppState) => AppState): void {
  const raw = fn(current);
  if (raw === current) return;
  const { state, events } = applyGamification(current, raw, new Date());
  commit(state);
  if (events.length > 0) eventListeners.forEach((l) => l(events));
}

/** Replace the whole state (backup import, reset). Never awards anything. */
export function replaceState(next: AppState): void {
  if (next === current) return;
  commit(next);
}

/** Listen for level-ups, badges and quests to celebrate them. */
export function onGameEvents(l: (events: GameEvent[]) => void): () => void {
  eventListeners.add(l);
  return () => {
    eventListeners.delete(l);
  };
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => current);
}

export function getSaveError(): string | null {
  return saveError;
}

export function exportJson(): string {
  return JSON.stringify({ ...current, exportedAt: new Date().toISOString() }, null, 2);
}
