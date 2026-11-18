import { useSyncExternalStore } from "react";
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

export function update(fn: (s: AppState) => AppState): void {
  current = fn(current);
  persist(current);
  listeners.forEach((l) => l());
}

export function replaceState(next: AppState): void {
  update(() => next);
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
